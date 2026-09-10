import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
})

app.use(cors())
app.use(express.json())

async function initDatabase() {
  try {
    const sqlPath = path.join(__dirname, '../database', 'init_schema.sql')
    const sql = await fs.readFile(sqlPath, 'utf8')
    await pool.query(sql)
    console.log('Esquema de base de datos inicializado/cargado correctamente.')
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, lastname, phoneNumber, email, dni, address, password } = req.body

    if (!name || !lastname || !phoneNumber || !email || !dni || !address ||!password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [email],
    )

    if (existing.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const nombres = name
    const apellidos = lastname
    const telefono = phoneNumber
    const cedula = dni
    const direccion = address

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombres, apellidos, telefono, correo, cedula, direccion, foto_usuario, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, telefono, email, cedula, direccion, null, passwordHash],
    )

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      userId: result.insertId,
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

    const [rows] = await pool.query(
      'SELECT id, nombres, apellidos, correo, password_hash FROM usuarios WHERE correo = ?',
      [email],
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    return res.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error en el servidor.' })
  }
})

async function startServer() {
  await initDatabase()

  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`)
  })
}

startServer().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err)
})

