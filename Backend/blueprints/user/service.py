from db.mssql import get_connection
from utils.response import success, error
from utils.format_db_response import format_db_response
from utils.token import create_jwt


def create_user(data):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT 1 FROM Users WHERE User_Email = ?', data["email"])

        if cursor.fetchone():
            return error('Email already exists', 400)

        cursor.execute("""
                            INSERT INTO
                                Users (User_Email, Password, Role_Id)
                            VALUES (?, ?, (SELECT ROLE_ID FROM Roles WHERE Role_Name = 'User'))""", data["email"], data["password"])

        conn.commit()
        return success("User registered successfully", status=201)

    except Exception as e:
        return error(str(e))

    finally:
        if cursor:
            cursor.close()
        if conn: 
            conn.close()


def login_user(data):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                User_Id,
                User_Email,
                (SELECT Role_Name FROM Roles AS R WHERE R.Role_Id = U.Role_Id) AS Role
            FROM
                Users AS U
            WHERE
                U.User_Email = ? AND
                U.Password = ?
            """, data["email"], data["password"])

        user = format_db_response(cursor=cursor)

        if not user:
            return error("Invalid credentials", 401)

        token = create_jwt(user[0].get('User_Id'), user[0].get('User_Email'), user[0].get('Role'))
        
        return success("Login successful", {'token': token, 'role': user[0].get('Role'), 'id': user[0].get('User_Id')})
    except Exception as e:
        return error(str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
