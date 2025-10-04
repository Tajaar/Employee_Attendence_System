from werkzeug.security import generate_password_hash,check_password_hash

print(generate_password_hash("admin123"))  # For admin
print(generate_password_hash("hr123"))     # For HR
print(generate_password_hash("user123"))   # For user

print(check_password_hash("scrypt:32768:8:1$3j282X1kprdh3tZc$6c3f8b7e6e14e04336e6a503b10d9ceea3d5cb724af092b24e2be776cab521df509d5653e89a59f4f12d9fb0a4d293f74380c9d0820b9ccabb95918c155749f0","admin123"))