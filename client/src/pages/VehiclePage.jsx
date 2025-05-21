import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Container, Row, Col, Image, Button, Spinner } from 'react-bootstrap'
import { vehiclesApi, categoriesApi, enginesApi, chassisApi, wheelFormulasApi, factoriesApi, priceListsApi } from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'


export default function VehiclePage() {
    const { id } = useParams()
    const [transport, setTransport] = useState(null)

    const { user } = useAuth();
    const { addToCart } = useCart()

    const [category, setCategory] = useState(null);
    const [engine, setEngine] = useState(null);
    const [chassis, setChassis] = useState(null);
    const [wheelFormula, setWheelFormula] = useState(null);
    const [factory, setFactory] = useState(null);
    const [priceList, setPriceList] = useState(null);

    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const fetchData = async () => {
            const vehicleResponse = await vehiclesApi.getById(id)
            const vehicleData = vehicleResponse.data
            setTransport(vehicleData)

            const categoryResponse = await categoriesApi.getById(vehicleData.category_id)
            setCategory(categoryResponse.data);
            
            const engineResponse = await enginesApi.getById(vehicleData.engine_id);
            setEngine(engineResponse.data);

            const chassisResponse = await chassisApi.getById(vehicleData.chassis_id);
            setChassis(chassisResponse.data);

            const wheelFormulaResponse = await wheelFormulasApi.getById(vehicleData.wheel_formula_id);
            setWheelFormula(wheelFormulaResponse.data);

            const factoryResponse = await factoriesApi.getById(vehicleData.factory_id);
            setFactory(factoryResponse.data);

            const priceListResponse = await priceListsApi.getByVehicleId(id);
            setPriceList(priceListResponse.data[0]);

            setLoading(false)
        }
        fetchData()
    }, [id])

    const handleBuyClick = () => {
        addToCart({
            id: transport.vehicle_id,
            title: transport.title,
            description: transport.description,
            price: priceList.price,
            imageUrl: `http://localhost:8000/images/vehicles/${transport.vehicle_id}`,
        })
    }

    if (loading) return <Spinner animation="border" className="mt-4" />

    return (
        <Container className="mt-4">
            <Row>
                <Col md={4}>
                    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                        <Image
                        src={`http://localhost:8000/images/vehicles/${transport.vehicle_id}`}
                        alt={transport.title}
                        className="img-fluid"
                        />
                    </div>
                </Col>

                <Col md={8}>
                    <h3>{transport.title}</h3>
                    <p>{transport.description}</p>
                    <p><strong>Категория:</strong> {category.name}</p>
                    <p><strong>Шасси:</strong> {chassis.name}</p>
                    <p><strong>Производитель:</strong> {factory.name}</p>
                    <p><strong>Двигатель:</strong> {engine.name}</p>
                    <p><strong>Колесная формула:</strong> {wheelFormula.name}</p>

                    <p><strong>Срок поставки:</strong> {new Date(priceList.delivery_time).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Цена:</strong> {priceList.price}</p>

                    {user ? (
                        <Link to="/cart">
                            <Button variant="success" onClick={handleBuyClick}>
                                Купить
                            </Button>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <Button variant="success" onClick={handleBuyClick}>
                                Войти для покупки
                            </Button>
                        </Link>
                    )}
                    
                </Col>
            </Row>
        </Container>
    )
}
