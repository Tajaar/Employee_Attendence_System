from jose import jwt
token = "<your_token>"
payload = jwt.decode(token, "Summa123", algorithms=["HS256"])
print(payload)
