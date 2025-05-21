import { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import { vehiclesApi } from '../api'


export default function ProfilePage() {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchVehicles = async () => {
            const response = await vehiclesApi.getUserVehicles()
            setVehicles(response.data)

        }

        fetchVehicles();
    }, []);

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Card.Title>Личный кабинет</Card.Title>

                    <p><strong>{user.name}</strong></p>

                    <Link to="/create">
                        <Button variant="primary">Создать объявление</Button>
                    </Link>
                </Card.Body>
            </Card>

            <h3 className="mt-4">Ваш транспорт</h3>

            {vehicles.length === 0 && <p>У вас нет добавленного транспорта.</p>}

            {vehicles.map(vehicle => (
                <Card className="mt-3" key={vehicle.id}>
                    <Card.Body>
                        <Card.Title>{vehicle.title}</Card.Title>
                        <Link to={`/vehicle/${vehicle.vehicle_id}`}>
                            <Button variant="outline-primary">Подробнее</Button>
                        </Link>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    )
}
