import hashlib

def generate_sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()