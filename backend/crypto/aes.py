from cryptography.fernet import Fernet
import base64
import hashlib


def derive_final_key(password: str, ecc_key: bytes) -> bytes:
    """
    Combines password and ECC-derived key
    to form final AES key.
    """
    password_hash = hashlib.sha256(password.encode()).digest()

    combined = bytes(a ^ b for a, b in zip(password_hash, ecc_key))

    return base64.urlsafe_b64encode(combined)


def aes_encrypt(message: str, password: str, ecc_key: bytes) -> bytes:
    key = derive_final_key(password, ecc_key)
    cipher = Fernet(key)
    return cipher.encrypt(message.encode())


def aes_decrypt(ciphertext: bytes, password: str, ecc_key: bytes) -> str:
    key = derive_final_key(password, ecc_key)
    cipher = Fernet(key)
    return cipher.decrypt(ciphertext).decode()