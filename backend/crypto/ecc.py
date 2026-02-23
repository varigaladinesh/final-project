# backend/crypto/ecc.py

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import os

KEY_FILE = "crypto/ecc_private_key.pem"


def load_or_create_private_key():
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return serialization.load_pem_private_key(f.read(), password=None)

    private_key = ec.generate_private_key(ec.SECP256R1())
    with open(KEY_FILE, "wb") as f:
        f.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            )
        )
    return private_key


PRIVATE_KEY = load_or_create_private_key()
PUBLIC_KEY = PRIVATE_KEY.public_key()


def generate_ecc_shared_secret():
    eph_private = ec.generate_private_key(ec.SECP256R1())
    eph_public = eph_private.public_key()

    shared_secret = eph_private.exchange(ec.ECDH(), PUBLIC_KEY)

    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"ecc-aes-key",
    ).derive(shared_secret)

    eph_pub_bytes = eph_public.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return eph_pub_bytes, derived_key


def recover_ecc_shared_secret(eph_pub_bytes: bytes):
    eph_public = serialization.load_der_public_key(eph_pub_bytes)

    shared_secret = PRIVATE_KEY.exchange(ec.ECDH(), eph_public)

    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"ecc-aes-key",
    ).derive(shared_secret)