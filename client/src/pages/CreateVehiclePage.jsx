import { useState, useEffect } from 'react'
import { Row, Col, Container, Card, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { categoriesApi, factoriesApi, chassisApi, wheelFormulasApi, enginesApi, vehiclesApi, imagesApi, priceListsApi } from '../api'
import { useAuth } from '../context/AuthContext';


export default function CreateVehiclePage() {

    const { user } = useAuth();

    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [factories, setFactories] = useState([])
    const [chassisList, setChassis] = useState([])
    const [wheelFormulas, setWheelFormulas] = useState([])
    const [engines, setEngines] = useState([])

    const [selectedImage, setSelectedImage] = useState(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        color: '',
        year: '',
        category_id: '',
        factory_id: '',
        chassis_id: '',
        wheel_formula_id: '',
        engine_id: '',
        price: '',
        delivery_time: ''
    })


    useEffect(() => {
        const fetchData = async () => {
            const categoryResponse = await categoriesApi.getAll();
            setCategories(categoryResponse.data);

            const factoryResponse = await factoriesApi.getAll();
            setFactories(factoryResponse.data);

            const chassisResponse = await chassisApi.getAll();
            setChassis(chassisResponse.data);

            const wheelFormulaResponse = await wheelFormulasApi.getAll();
            setWheelFormulas(wheelFormulaResponse.data);

            const engineResponse = await enginesApi.getAll();
            setEngines(engineResponse.data);
        }
        fetchData()
    }, [])

    const handleChange = e => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value
        })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedImage(file);
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()

        const vehiclePayload = {
            title: form.title,
            description: form.description,
            year: parseInt(form.year),
            color: form.color,
            category_id: form.category_id ? parseInt(form.category_id) : null,
            engine_id: form.engine_id ? parseInt(form.engine_id) : null,
            chassis_id: form.chassis_id ? parseInt(form.chassis_id) : null,
            wheel_formula_id: form.wheel_formula_id ? parseInt(form.wheel_formula_id) : null,
            factory_id: form.factory_id ? parseInt(form.factory_id) : null,
            user_id: user.user_id
        }

        const response = await vehiclesApi.create(vehiclePayload)
        const vehicleId = response.data.vehicle_id;

        const priceListPayload = {
            price: parseInt(form.price),
            delivery_time: `${form.delivery_time}T00:00:00`,
            user_id: user.user_id,
            vehicle_id: vehicleId
        }

        await priceListsApi.create(priceListPayload)

        if (selectedImage) {
            const formData = new FormData();
            formData.append('file', selectedImage);

            await imagesApi.uploadVehicleImage(vehicleId, formData)
        }

        navigate('/profile')
    }

  return (
    <Container className="mt-4 mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Создать объявление</Card.Title>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Название техники</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Цвет</Form.Label>
              <Form.Control
                name="color"
                value={form.color}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Год выпуска</Form.Label>
              <Form.Control
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Срок доставки</Form.Label>
              <input
                    type="date"
                    className={`form-control`}
                    id="delivery_time"
                    name="delivery_time"
                    value={form.delivery_time}
                    onChange={handleChange}
                />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Категория</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите...</option>
                    {categories.map(c =>
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Производитель</Form.Label>
                  <Form.Select
                    name="factory_id"
                    value={form.factory_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите...</option>
                    {factories.map(f =>
                      <option key={f.factory_id} value={f.factory_id}>
                        {f.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Шасси</Form.Label>
                  <Form.Select
                    name="chassis_id"
                    value={form.chassis_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите...</option>
                    {chassisList.map(c =>
                      <option key={c.chassis_id} value={c.chassis_id}>
                        {c.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Колёсная формула</Form.Label>
                  <Form.Select
                    name="wheel_formula_id"
                    value={form.wheel_formula_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите...</option>
                    {wheelFormulas.map(w =>
                      <option key={w.wheel_formula_id} value={w.wheel_formula_id}>
                        {w.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Двигатель</Form.Label>
              <Form.Select
                name="engine_id"
                value={form.engine_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите...</option>
                {engines.map(e =>
                  <option key={e.engine_id} value={e.engine_id}>
                    {e.name}
                  </option>
                )}
              </Form.Select>
            </Form.Group>

            <input
                type="file"
                className="form-control"
                id="image"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleImageChange}
            />

            <Button type="submit">Создать
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
