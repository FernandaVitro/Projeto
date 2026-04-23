const express = require('express')
const cors = require('cors')
const porta = 3000
const app = express()

app.use(cors())
app.use(express.json())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const conexao = require("./db.js")
const crypto = require('crypto')

// JWT
const jwt = require('jsonwebtoken')
const api_chave = "segredo_super_secreto"

// ================= UPLOAD =================
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

const upload = multer({ storage })

app.use('/uploads', express.static('uploads'))

// ================= MIDDLEWARE TOKEN =================
function autenticarToken(req, res, next) {
    const authHeader = req.headers["authorization"]

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não enviado" })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, api_chave, (err, user) => {
        if (err) {
            return res.status(403).json({ erro: "Token inválido" })
        }

        req.user = user
        next()
    })
}

// ================= SERVIDOR =================
app.listen(porta, () => {
    console.log(`Servidor rodando em: http://localhost:${porta}`)
})

// ================= CADASTRO USUÁRIO =================
app.post("/cadastroUsuario", async (req, res) => {
    try {
        const { nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf } = req.body
        let { senha } = req.body

        senha = senha.trim()

        if (senha === "") return res.json({ resposta: "Preencha sua senha" })
        if (senha.length < 6) return res.json({ resposta: "Senha muito curta" })
        if (email.length < 6) return res.json({ resposta: "Email inválido" })
        if (nome_completo.length < 6) return res.json({ resposta: "Nome inválido" })

        let [existeEmail] = await conexao.query('SELECT * FROM cadastro_usuario WHERE email = ?', [email])
        if (existeEmail.length !== 0) return res.json({ resposta: "E-mail já cadastrado" })

        let [existeCpf] = await conexao.query('SELECT * FROM cadastro_usuario WHERE cpf = ?', [cpf])
        if (existeCpf.length !== 0) return res.json({ resposta: "CPF já cadastrado" })

        let [existeTelefone] = await conexao.query('SELECT * FROM cadastro_usuario WHERE telefone = ?', [telefone])
        if (existeTelefone.length !== 0) return res.json({ resposta: "Telefone já cadastrado" })

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        let [resultado] = await conexao.query(`
            INSERT INTO cadastro_usuario 
            (nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf, senha) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `, [nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf, hash])

        const id_usuario = resultado.insertId

        await conexao.query(`INSERT INTO perfil_usuario (id_usuario) VALUES (?)`, [id_usuario])

        res.json({ resposta: "Cadastro efetuado com sucesso!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// ================= LOGIN USUÁRIO =================
app.post("/loginUsuario", async (req, res) => {
    try {
        const { cpf } = req.body
        let { senha } = req.body

        senha = senha.trim()

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        const [resultado] = await conexao.query(
            `SELECT * FROM cadastro_usuario WHERE cpf = ? AND senha = ?`,
            [cpf, hash]
        )

        if (resultado.length > 0) {

            const token = jwt.sign(
                { id_usuario: resultado[0].id_usuario },
                api_chave,
                { expiresIn: "1h" }
            )

            res.json({
                valido: true,
                token: token,
                id_usuario: resultado[0].id_usuario
            })

        } else {
            res.json({ valido: false })
        }

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// ================= CADASTRO EMPRESA =================
app.post("/cadastroEmpresa", async (req, res) => {
    try {
        const { nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao } = req.body
        let { senha } = req.body

        senha = senha.trim()

        if (senha.length < 6) return res.json({ resposta: "Senha inválida" })

        let [existeEmail] = await conexao.query('SELECT * FROM cadastro_empresas WHERE email = ?', [email])
        if (existeEmail.length !== 0) return res.json({ resposta: "E-mail já cadastrado" })

        let [existeCnpj] = await conexao.query('SELECT * FROM cadastro_empresas WHERE cnpj = ?', [cnpj])
        if (existeCnpj.length !== 0) return res.json({ resposta: "CNPJ já cadastrado" })

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        await conexao.query(`
            INSERT INTO cadastro_empresas 
            (nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, senha) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `, [nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, hash])

        res.json({ resposta: "Cadastro efetuado com sucesso!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// ================= LOGIN EMPRESA =================
app.post("/loginEmpresa", async (req, res) => {
    try {
        const { email } = req.body
        let { senha } = req.body

        senha = senha.trim()

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        const [resultado] = await conexao.query(
            `SELECT * FROM cadastro_empresas WHERE email = ? AND senha = ?`,
            [email, hash]
        )

        if (resultado.length > 0) {

            const token = jwt.sign(
                { id_empresa: resultado[0].id_empresa },
                api_chave,
                { expiresIn: "1h" }
            )

            res.json({
                ok: true,
                token: token,
                id_empresa: resultado[0].id_empresa
            })

        } else {
            res.json({ ok: false })
        }

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// ================= VAGAS (PROTEGIDO) =================
app.post("/vagasCriar", autenticarToken, async (req, res) => {
    try {

        if (!req.user.id_empresa) {
            return res.status(403).json({ erro: "Apenas empresas podem criar vagas" })
        }

        const {
            titulo_vaga,
            tipo,
            modalidade,
            area,
            descricao,
            cidade,
            uf,
            salario,
            idade_minima,
            idade_maxima,
            requisitos
        } = req.body

        const requisitosTexto = Array.isArray(requisitos)
            ? requisitos.join(', ')
            : (requisitos || "")

        await conexao.query(`
            INSERT INTO vagas_criar 
            (id_empresa, titulo_vaga, tipo, modalidade, area, descricao, cidade, uf, salario, idade_minima, idade_maxima, requisitos) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.id_empresa,
            titulo_vaga,
            tipo,
            modalidade,
            area || "Geral",
            descricao,
            cidade,
            uf,
            salario || "A combinar",
            idade_minima || 14,
            idade_maxima || 24,
            requisitosTexto
        ])

        res.json({ resposta: "Vaga publicada!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// ================= PERFIL (PROTEGIDO) =================
app.get("/perfil/:id", autenticarToken, async (req, res) => {

    const id = req.user.id_usuario

    const [dados] = await conexao.query(`
        SELECT 
            c.nome_completo,
            c.email,
            c.data_nasc,
            c.telefone,
            c.cidade,
            p.*
        FROM cadastro_usuario c
        JOIN perfil_usuario p ON c.id_usuario = p.id_usuario
        WHERE c.id_usuario = ?
    `, [id])

    res.json(dados[0])
})

// ================= EDITAR PERFIL (PROTEGIDO) =================
app.put("/perfil/:id",
    autenticarToken,
    upload.fields([
        { name: 'foto' },
        { name: 'curriculo' }
    ]),
    async (req, res) => {

        try {

            const id = req.user.id_usuario

            const {
                nome_completo,
                data_nasc,
                telefone,
                cidade,
                sobre_voce,
                escolaridade,
                instituicao,
                curso,
                habilidades
            } = req.body

            const foto = req.files?.foto?.[0]?.filename || null
            const curriculo = req.files?.curriculo?.[0]?.filename || null

            await conexao.query(`
                UPDATE cadastro_usuario
                SET nome_completo=?, data_nasc=?, telefone=?, cidade=?
                WHERE id_usuario=?
            `, [nome_completo, data_nasc, telefone, cidade, id])

            await conexao.query(`
                UPDATE perfil_usuario
                SET 
                    sobre_voce=?,
                    escolaridade=?,
                    instituicao=?,
                    curso=?,
                    habilidades=?,
                    foto_perfil = COALESCE(?, foto_perfil),
                    arquivo_pdf = COALESCE(?, arquivo_pdf)
                WHERE id_usuario=?
            `, [
                sobre_voce,
                escolaridade,
                instituicao,
                curso,
                habilidades,
                foto,
                curriculo,
                id
            ])

            res.json({ ok: true })

        } catch (error) {
            res.status(500).json({ erro: "Erro ao atualizar perfil" })
        }
    }
)
