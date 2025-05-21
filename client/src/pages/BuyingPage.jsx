import { useState } from 'react'
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function BuyingPage() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        paymentMethod: '',
        deliveryType: '',
        companyName: '',
        name: '',
        email: '',
        phone: '',
        city: '',
        message: ''
    })


    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)

    if (!form.name || !form.email || !form.phone || !form.city || !form.paymentMethod || !form.deliveryType) {
        return
    }


    navigate('/')
    }

    return (
        <Container className="mt-4 mb-4">
            <Card>
                <Card.Body>
                    <Card.Title>Оформление покупки</Card.Title>
                    <Form onSubmit={handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label>Название компании</Form.Label>
                            <Form.Control
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

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
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Город</Form.Label>
                            <Form.Control
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Сообщение</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Метод оплаты</Form.Label>
                                    <Form.Select
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите...</option>
                                        <option value="card">Банковская карта</option>
                                        <option value="sbp">СБП</option>
                                        <option value="cash">Наличные</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Тип доставки</Form.Label>
                                    <Form.Select
                                        name="deliveryType"
                                        value={form.deliveryType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите...</option>
                                        <option value="pickup">Самовывоз</option>
                                        <option value="delivery">Доставка</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button type="submit">Оформить заказ</Button>
                    </Form>
                 </Card.Body>
            </Card>
        </Container>
    )
}
