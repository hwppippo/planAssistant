class GlobalVar:
    access_token = "",


def set_access_token(token):
    GlobalVar.access_token = token


def get_access_token():
    return GlobalVar.access_token
