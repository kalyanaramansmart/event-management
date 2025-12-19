IF DB_ID('EventManagement') IS NULL
BEGIN
    CREATE DATABASE EventManagement;
END
GO

USE EventManagement;
GO

IF OBJECT_ID('Roles', 'U') IS NULL
CREATE TABLE Roles (
    Role_Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Role_Name VARCHAR(50) NOT NULL UNIQUE
);

IF OBJECT_ID('Categories', 'U') IS NULL
CREATE TABLE Categories (
    Category_Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Category_Name VARCHAR(50) NOT NULL UNIQUE,
    Is_Active BIT DEFAULT 1
);

IF OBJECT_ID('Users', 'U') IS NULL
CREATE TABLE Users (
    User_Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    User_Email VARCHAR(254) NOT NULL UNIQUE,
    Password VARCHAR(20) NOT NULL,
    Role_Id UNIQUEIDENTIFIER NOT NULL,
    Is_Active BIT DEFAULT 1,
    FOREIGN KEY (Role_Id) REFERENCES Roles(Role_Id)
);

IF OBJECT_ID('User_Preferences', 'U') IS NULL
CREATE TABLE User_Preferences (
    Preference_Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    User_Id UNIQUEIDENTIFIER NOT NULL,
    Category_Id UNIQUEIDENTIFIER NOT NULL,
    UNIQUE (User_Id, Category_Id),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id),
    FOREIGN KEY (Category_Id) REFERENCES Categories(Category_Id)
);

IF OBJECT_ID('Time_Slots', 'U') IS NULL
CREATE TABLE Time_Slots (
    Slot_Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title TEXT NOT NULL,
    Start_At DATETIME2 NOT NULL,
    End_At DATETIME2 NOT NULL,
    Category_Id UNIQUEIDENTIFIER NOT NULL,
    Booked_By UNIQUEIDENTIFIER NULL,
    Is_Active BIT DEFAULT 1,
    FOREIGN KEY (Category_Id) REFERENCES Categories(Category_Id),
    FOREIGN KEY (Booked_By) REFERENCES Users(User_Id)
);

IF NOT EXISTS (SELECT 1 FROM Roles)
INSERT INTO Roles(Role_Name) VALUES ('Admin'), ('User');

IF NOT EXISTS (SELECT 1 FROM Categories)
INSERT INTO Categories(Category_Name) VALUES ('Yoga'), ('Body Building');

IF NOT EXISTS (SELECT 1 FROM Users WHERE User_Email = 'interviewer@cts.com')
INSERT INTO Users (User_Email, Password, Role_Id)
VALUES (
    'interviewer@cts.com',
    'Admin@123',
    (SELECT Role_Id FROM Roles WHERE Role_Name = 'Admin')
);
