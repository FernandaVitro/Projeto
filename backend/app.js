const express = require('express')
const cors = require('cors')
const porta = 3000
const app = express()
app.use(cors())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


const conexao = require("./db.js")

//consegue acessar ps dados do body
app.use(express.json())

//módulo crypto
const crypto = require('crypto')


app.listen(porta, () => {
    console.log(`servidor rodando em : http://localhost:${porta}`)
})

// Candidatos

app.post("/cadastroUsuario", async (req, res) => {
    try {
        const { nome_completo, data_nasc, cpf , rg, email, telefone, endereco, cidade, uf } = req.body
        let {senha} = req.body

        // validar as infos
        senha = senha.trim()
        senha = senha.replace("", "")

        if (senha == "") {
            return res.json({"resposta":"Preencha sua senha"})
        } 
        
        else if (senha.length < 6) {
            return res.json({"resposta":"A senha tem que conter no minimo 6 caracteres"})
        } 
        
        else if (email.length < 6) {
            return res.json({"resposta":"Insira um email"})
        } 
        
        
        else if (nome_completo.length < 6) {
            return res.json({"resposta":"Insira o nome completo"})
        }

        // Verificar se o e-mail já está cadastrado

        let sql = 'Select * from cadastro_usuario where email = ?'
        let [resultado] = await conexao.query(sql,[email])
        
        if (resultado.length != 0){
            return res.json({"resposta":"E-mail já cadastrado"})
        }


        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        sql = `INSERT INTO cadastro_usuario (nome_completo, data_nasc, cpf , rg, email, telefone, endereco, cidade, uf, senha) VALUES (?,?,?,?,?,?,?,?,?,?)`

        let [resultado2] = await conexao.query(sql, [nome_completo, data_nasc, cpf , rg, email, telefone, endereco, cidade, uf, hash])

        if (resultado2.affectedRows == 1) {
            res.json({ "resposta": "Cadastro efetuado com sucesso!" })
        } else {
            res.json({ "resposta": "Erro ao fazer cadastro!" })
        }

    } catch (error) {
        console.log(error)
    }
})


app.post("/loginUsuario", async (req, res) => {
    try {
        const { cpf } = req.body
        let { senha } = req.body
        senha = senha.trim()
        senha = senha.replace("", "")

        if (senha == "") {
            return res.send("preencha sua senha")
        } else if (senha.length < 6) {
            return res.send("a senha tem que conter no minimo 6 caracteres")
        }

        const hash = crypto.createHash("sha256").update(senha).digest("base64")
        const sql = `SELECT * from cadastro_usuario  WHERE  cpf = ? and senha = ?`
        const [resultado] = await conexao.query(sql, [cpf, hash])

        if (resultado.length > 0) {
            res.send("valido")
        } else {
            res.send("invalido")
        }
    } catch (error) {
        console.log(error)

    }

})

// Empresa

app.post("/cadastroEmpresa", async (req, res) => {
    try {
        const { nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao } = req.body
        let {senha} = req.body

        // validar as infos
        senha = senha.trim()
        senha = senha.replace("", "")

        if (senha == "") {
            return res.json({"resposta":"Preencha sua senha"})
        } 
        
        else if (senha.length < 6) {
            return res.json({"resposta":"A senha tem que conter no minimo 6 caracteres"})
        } 
        
        else if (email.length < 6) {
            return res.json({"resposta":"Insira um email válido"})
        } 
        

        // Verificar se o e-mail já está cadastrado

        let sql = 'Select * from cadastro_empresas where email = ?'
        let [resultado] = await conexao.query(sql,[email])
        
        if (resultado.length != 0){
            return res.json({"resposta":"E-mail já cadastrado"})
        }


        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        sql = `INSERT INTO cadastro_empresas (nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, senha) VALUES (?,?,?,?,?,?,?,?,?,?)`

        let [resultado2] = await conexao.query(sql, [ nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, hash])

        if (resultado2.affectedRows == 1) {
            res.json({ "resposta": "Cadastro efetuado com sucesso!" })
        } else {
            res.json({ "resposta": "Erro ao fazer cadastro!" })
        }

    } catch (error) {
        console.log(error)
    }
})


app.post("/loginEmpresa", async (req, res) => {
    try {
        const { email } = req.body
        let { senha } = req.body
        senha = senha.trim()
        senha = senha.replace("", "")

        if (senha == "") {
            return res.send("preencha sua senha")
        } else if (senha.length < 6) {
            return res.send("a senha tem que conter no minimo 6 caracteres")
        }

        const hash = crypto.createHash("sha256").update(senha).digest("base64")
        const sql = `SELECT * from cadastro_empresas  WHERE  email = ? and senha = ?`
        const [resultado] = await conexao.query(sql, [email, hash])

        if (resultado.length > 0) {
            res.send("valido")
        } else {
            res.send("invalido")
        }
    } catch (error) {
        console.log(error)

    }

})