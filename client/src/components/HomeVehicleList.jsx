import { useEffect, useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { vehiclesApi } from '../api';

export default function HomeVehicleList() {
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchVehicles = async () => {
            const response = await vehiclesApi.getAll({limit: 6})

            setVehicles(response.data)
        }

        fetchVehicles();
    }, []);

    return (
        <Row className="g-4">
            {vehicles.map(vehicle => (
                <Col md={6} lg={4} key={vehicle.vehicle_id}>
                    <Card>
                        <Card.Img
                            variant="top"
                            src={`http://localhost:8000/images/vehicles/${vehicle.vehicle_id}`}
                            alt={vehicle.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                            <Card.Title>{vehicle.title}</Card.Title>
                            <Card.Text>{vehicle.description}</Card.Text>
                            <Link to={`/vehicle/${vehicle.vehicle_id}`}>
                                <Button variant="primary">Подробнее</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
