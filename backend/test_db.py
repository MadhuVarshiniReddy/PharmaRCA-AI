from app.database import engine

try:
    with engine.connect() as connection:
        print("PostgreSQL connection successful!")
        print("Database: pharmarca")

except Exception as error:
    print("Database connection failed!")
    print(error)