-- Check Windows Authentication setup
SELECT 
    'Server Information' as Info,
    @@VERSION as ServerVersion,
    @@SERVERNAME as ServerName,
    SERVERPROPERTY('IsIntegratedSecurityOnly') as WindowsAuthOnly,
    SYSTEM_USER as CurrentUser,
    IS_SRVROLEMEMBER('sysadmin') as IsSysAdmin;

-- Check if current user has database access
SELECT 
    'Database Access' as Info,
    DB_NAME() as CurrentDatabase,
    USER_NAME() as DatabaseUser,
    IS_MEMBER('db_owner') as IsDbOwner,
    HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'CREATE TABLE') as CanCreateTables;

-- List available databases the user can access
SELECT 
    name as DatabaseName,
    database_id,
    create_date,
    collation_name
FROM sys.databases 
WHERE HAS_PERMS_BY_NAME(name, 'DATABASE', 'CONNECT') = 1
ORDER BY name;
