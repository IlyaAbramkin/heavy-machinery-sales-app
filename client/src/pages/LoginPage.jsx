import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Form, Button, Container, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext';


export default function LoginPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const isRegister = new URLSearchParams(location.search).get('mode') === 'register'

    const [form, setForm] = useState({ email: '', name: '', password: '' })
    const [error, setError] = useState(null)

    const { login, register } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

            
        if (isRegister) {
            if (form.password !== form.confirmPassword) {
                setError('Пароли не совпадают')
                return
            }

            await register({
                email: form.email,
                name: form.name,
                password: form.password
            })
        }


        await login({
            email: form.email,
            password: form.password
        })

        navigate('/')
    }

    return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4">{isRegister ? 'Регистрация' : 'Вход'}</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
        {isRegister && (
            <Form.Group className="mb-3">
            <Form.Label>Имя</Form.Label>
            <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
            />
            </Form.Group>
        )}

        <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
            />
        </Form.Group>

        {isRegister && (
            <Form.Group className="mb-3">
            <Form.Label>Подтверждение пароля</Form.Label>
            <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
            />
            </Form.Group>
        )}

        <Button type="submit" variant="primary">
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </Button>
        </Form>
    </Container>
    )
}
