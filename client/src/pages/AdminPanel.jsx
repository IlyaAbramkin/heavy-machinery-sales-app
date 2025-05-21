import { useEffect, useState } from 'react'
import { Container, Button, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { requestsApi, tovaryApi, vehiclesApi } from '../api'

export default function AdminPanel() {
    const [orders, setOrders] = useState([])
    const [goods, setGoods] = useState([])
    const [vehicles, setVehicles] = useState([])

    const STATUSES = {
        CREATED: "заявка создана",
        PROCESSING: "заявка обрабатывается",
        RECEIVED: "заявка получена",
        COMPLETED: "заявка выполнена"
    }


    useEffect(() => {
        const fetchOrders = async () => {
            const ordersResponse = await requestsApi.getAll()
            const sortedOrders = ordersResponse.data.sort((a, b) => a.request_id - b.request_id)
            setOrders(sortedOrders)

            const goodsResponse = await tovaryApi.getAll()
            setGoods(goodsResponse.data)

            const vehiclesResponse = await vehiclesApi.getAll()
            setVehicles(vehiclesResponse.data)

            // console.log(goods)
        }

        fetchOrders()
    }, [])

    const getOrderItems = (requestId) => {
        return goods.filter(item => item.request_id === requestId).map(item => {
                const vehicle = vehicles.find(v => v.vehicle_id === item.vehicle_id)
                return {
                    title: vehicle ? vehicle.title : `ID ${item.vehicle_id}`,
                    quantity: item.quantity
                }
            })
    }

    const updateStatus = async (requestId, newStatus) => {
        await requestsApi.update(requestId, { status: newStatus })
        setOrders(prev => prev.map(order =>
            order.request_id === requestId ? { ...order, status: newStatus } : order
        ))
    }

    const deleteOrder = async (requestId) => {
        await requestsApi.delete(requestId)
        setOrders(prev => prev.filter(order => order.request_id !== requestId))
    }


    return (
        <Container className="mt-5">
            <h2 className="mb-4">Панель администратора</h2>

            <Link to="/createNews">
                <Button variant="success" onClick={() => {}}>
                    Создать новость
                </Button>
            </Link>

            <hr></hr>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Компания</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Телефон</th>
                        <th>Город</th>
                        <th>Сообщение</th>
                        <th>Оплата</th>
                        <th>Доставка</th>
                        <th>Товары</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.request_id}>
                            <td>{order.request_id}</td>
                            <td>{order.company_name}</td>
                            <td>{order.full_name}</td>
                            <td>{order.email}</td>
                            <td>{order.phone}</td>
                            <td>{order.city}</td>
                            <td>{order.message}</td>
                            <td>{order.payment_method}</td>
                            <td>{order.delivery_type}</td>
                            <td>
                                <ul className="mb-0 list-unstyled">
                                    {getOrderItems(order.request_id).map(item => (
                                        <>
                                            <li key={order.request_id} className="pb-1">
                                                {item.title} — {item.quantity} шт.
                                            </li>
                                            <hr className='my-1'></hr>
                                        </>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                <div style={{ width: "160px" }}>
                                    <select
                                        className="form-select form-select-sm"
                                        value={order.status}
                                        onChange={e => updateStatus(order.request_id, e.target.value)}
                                    >
                                        {Object.values(STATUSES).map(statusLabel => (
                                            <option key={statusLabel} value={statusLabel}>
                                                {statusLabel}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="mt-1"
                                        onClick={() => deleteOrder(order.request_id)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    )
}
