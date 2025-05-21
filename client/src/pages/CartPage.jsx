import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { Container, Row, Col, Button, Image, Form, Card } from 'react-bootstrap'
import { requestsApi } from '../api'
import { useNavigate } from 'react-router-dom'

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
    const navigate = useNavigate()

    const [showForm, setShowForm] = useState(false)
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        const requestPayload = {
            session_id: Math.floor(Math.random() * 1000000),
            company_name: form.companyName,
            full_name: form.name,
            email: form.email,
            phone: form.phone,
            city: form.city,
            message: form.message,
            payment_method: form.paymentMethod,
            delivery_type: form.deliveryType,
            tovary_v_zayavke: cart.map(item => ({
                vehicle_id: item.id,
                quantity: item.quantity,
                name: item.title,
                price: item.price
            }))
        }

        await requestsApi.createOrder(requestPayload)

        clearCart()
        navigate('/')
    }

    const handleOrderClick = () => setShowForm(true)

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (cart.length === 0) {
        return (
            <Container className="mt-4">
                <h3>Корзина</h3>
                <p>Ваша корзина пуста.</p>
            </Container>
        )
    }

    return (
        <Container className="mt-4 mb-5">
            <h3>Корзина</h3>

            {cart.map(item => (
                <Row key={item.id} className="mb-4 align-items-center">
                    <Col md={2}>
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fluid
                            style={{ maxHeight: '100px', objectFit: 'contain' }}
                        />
                    </Col>

                    <Col md={4}>
                        <h5>{item.title}</h5>
                        <p>{item.description}</p>
                    </Col>

                    <Col md={2}><strong>{item.price} ₽</strong></Col>

                    <Col md={2}>
                        <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        />
                    </Col>

                    <Col md={2}>
                        <Button variant="danger" onClick={() => removeFromCart(item.id)}>Удалить</Button>
                    </Col>
                </Row>
            ))}

            <Row className="mt-4">
                <Col md={{ span: 4, offset: 8 }}>
                    <h5>Итого: {totalPrice} ₽</h5>
                    {!showForm && (
                        <Button variant="success" onClick={handleOrderClick}>
                            Оформить заказ
                        </Button>
                    )}
                </Col>
            </Row>

            {showForm && (
                <Card className="mt-4">
                    <Card.Body>
                        <Card.Title>Введите данные для заказа</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Название компании</Form.Label>
                                <Form.Control name="companyName" value={form.companyName} onChange={handleChange} />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control name="name" value={form.name} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Город</Form.Label>
                                <Form.Control name="city" value={form.city} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Сообщение</Form.Label>
                                <Form.Control as="textarea" rows={3} name="message" value={form.message} onChange={handleChange} />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Метод оплаты</Form.Label>
                                        <Form.Select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
                                            <option value="">Выберите...</option>
                                            <option value="банковская карта">Банковская карта</option>
                                            <option value="СБП">СБП</option>
                                            <option value="наличные">Наличные</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Тип доставки</Form.Label>
                                        <Form.Select name="deliveryType" value={form.deliveryType} onChange={handleChange} required>
                                            <option value="">Выберите...</option>
                                            <option value="самовывоз">Самовывоз</option>
                                            <option value="доставка">Доставка</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button type="submit" variant="primary">Подтвердить заказ</Button>
                        </Form>
                    </Card.Body>
                </Card>
            )}
        </Container>
    )
}
