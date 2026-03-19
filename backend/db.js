//Meu arquivo de conexão com o banco de dados
const mysql = require('mysql2/promise')

// tunel de conexao entre o meu codigo e o banco de dados
// pool : conexao
const conexao = mysql.createPool({

    // criar as configuraçoes do BD
    host: "localhost", //endereço para chegar no banco de dados
    user: "root",
    password: "",
    port: 3306,
    database: "SIEP", // nome do banco
    waitForConnections: true, // vai ver se está cheio, quando sair alguem eu coloco/ false: aguarde, espere uns minutos
    connectionLimit: 10,// limite de uso de conexoes simultania 
    queueLimit: 0 // numero de req simultanias que vou permitir ou nao/ 0: varias pessoas pode manusear simultaniamente

})

// fazer o arquivo index consegue enxergar o DB agora
// mesmo que: const conexao = require('./db)
module.exports = conexao // nome do exporte