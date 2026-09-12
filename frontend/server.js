import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '3690',
  database: process.env.DB_NAME || 'aver',
})

app.use(cors())
app.use(express.json())

app.post('/api/register', async (req, res) => {
  try {
    const { name, lastname, phoneNumber, email, dni, password } = req.body

    if (!name || !lastname || !phoneNumber || !email || !dni || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' })
    }

    // Comprobar si existe por correo
    const existing = await pool.query(
      'SELECT ciuser FROM usuario WHERE correousuario = $1 OR ciuser = $2',
      [email, dni]
    )

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'El correo o la cédula ya están registrados.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Insertar según el esquema de tu base de datos de PostgreSQL
    await pool.query(
      `INSERT INTO usuario (ciuser, nombreusuario, apellusuario, teleusuario, correousuario, contrase, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [dni, name, lastname, phoneNumber, email, passwordHash, true]
    )

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      userId: dni,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error en el servidor.' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos.' })
    }

    // Buscar en la tabla 'usuario' de Postgres
    const result = await pool.query(
      'SELECT ciuser, nombreusuario, apellusuario, correousuario, contrase FROM usuario WHERE correousuario = $1 AND activo = true',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.contrase)

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    return res.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.ciuser,
        nombres: user.nombreusuario,
        apellidos: user.apellusuario,
        correo: user.correousuario,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error en el servidor.' })
  }
})

async function startServer() {
  try {
    // Probar conexión a Postgres
    await pool.query('SELECT NOW()')
    console.log('Conexión a la base de datos PostgreSQL exitosa.')

    app.listen(PORT, () => {
      console.log(`Servidor backend escuchando en http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err)
  }
}

startServer()