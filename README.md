// 创建数据库

use cnode

// 创建用户

db.createUser(
...   {
...     user: "dba",
...     pwd: "dba",
...     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
...   }
... )