import sys
sys.path.append('..')

from auth import get_password_hash

def create_password_hash(password: str):
    hashed = get_password_hash(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")
    print("\nUse this hash in your SQL INSERT statement:")
    print(f"INSERT INTO employees (employee_code, full_name, email, password_hash, role, is_active)")
    print(f"VALUES ('EMP001', 'Your Name', 'your@email.com', '{hashed}', 'employee', 1);")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        password = sys.argv[1]
    else:
        password = input("Enter password to hash: ")

    create_password_hash(password)
