import os
import requests

app_key = os.getenv("KIS_APP_KEY")
secret_key = os.getenv("KIS_SECRET_KEY")

# 🔍 환경변수 확인
print("KIS_APP_KEY:", app_key)
print("KIS_SECRET_KEY:", secret_key)

if not app_key or not secret_key:
    raise RuntimeError("환경변수가 설정되지 않았습니다.")

url = "https://openapivts.koreainvestment.com:29443/oauth2/Approval"

body = {
    "grant_type": "client_credentials",
    "appkey": app_key,
    "secretkey": secret_key
}

headers = {
    "Content-Type": "application/json; utf-8"
}

resp = requests.post(url, json=body, headers=headers)
resp.raise_for_status()

approval_key = resp.json().get("approval_key")
print("approval_key:", approval_key)
