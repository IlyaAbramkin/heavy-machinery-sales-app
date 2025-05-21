import { Card, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function CatalogVehicleList({ vehicles, filters }) {
    const filteredVehicles = vehicles.filter(vehicle => {

        if (filters.category && vehicle.category_id != filters.category)
            return false
        if (filters.chassis && vehicle.chassis_id != filters.chassis)
            return false
        if (filters.factory && vehicle.factory_id != filters.factory)
            return false
        if (filters.wheelFormula && vehicle.wheel_formula_id != filters.wheelFormula)
            return false
        if (filters.engine && vehicle.engine_id != filters.engine)
            return false

        return true
    })

    return (
        <>
            {filteredVehicles.length === 0 && <p>Нет техники по выбранным фильтрам</p>}

            {filteredVehicles.map(vehicle => (
                <Card className="mb-3" key={vehicle.vehicle_id}>
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={3}>
                                <img
                                    src={`http://localhost:8000/images/vehicles/${vehicle.vehicle_id}`}
                                    alt={vehicle.title}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        objectFit: 'cover',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </Col>
                            <Col md={7}>
                                <h5>{vehicle.title}</h5>
                                <p className="text-muted">{vehicle.description}</p>
                            </Col>
                            <Col md={2} className="text-end">
                                <Link to={`/vehicle/${vehicle.vehicle_id}`}>
                                    <Button variant="outline-primary">Подробнее</Button>
                                </Link>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </>
    )
}
