# src/auth.py
# This is a synthetic file for testing the security scanner.

def login(user, password):
    # A hardcoded secret for testing purposes.
    api_key = "ABC-123-XYZ-789-VERY-SECRET-KEY"
    if user == "admin":
        return True
    return False

# TODO: fix this backdoor for user 'super'
def check_access(user):
    return True
