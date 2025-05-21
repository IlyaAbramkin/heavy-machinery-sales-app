import { useEffect, useState } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import { categoriesApi, chassisApi, factoriesApi, wheelFormulasApi, enginesApi, vehiclesApi } from '../api'

import CatalogVehicleList from '../components/CatalogVehicleList';

export default function CatalogPage() {
    const [filters, setFilters] = useState({
        category: '', 
        chassis: '', 
        factory: '', 
        wheelFormula: '', 
        engine: ''
    })

    const [catalog, setCatalog] = useState([])
    
    const [categories, setCategories] = useState([])
    const [chassisList, setChassis] = useState([])
    const [factories, setFactories] = useState([])
    const [engine, setEngine] = useState([])
    const [wheelFormula, setWheelFormula] = useState([])



    useEffect(() => {
        const fetchFilters = async () => {
            const categoryResponse = await categoriesApi.getAll()
            setCategories(categoryResponse.data);

            const engineResponse = await enginesApi.getAll();
            setEngine(engineResponse.data);

            const chassisResponse = await chassisApi.getAll();
            setChassis(chassisResponse.data);

            const wheelFormulaResponse = await wheelFormulasApi.getAll();
            setWheelFormula(wheelFormulaResponse.data);

            const factoryResponse = await factoriesApi.getAll();
            setFactories(factoryResponse.data);

            const catalogResponse = await vehiclesApi.getAll();
            setCatalog(catalogResponse.data);
        }

        fetchFilters()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    return (
        <Container className="mt-4 mb-4">
            <Row>
                <Col md={3}>
                    <h5>Фильтр</h5>

                    <Form.Group className="mb-3">
                        <Form.Label>Категория</Form.Label>
                        <Form.Select name="category" value={filters.category} onChange={handleChange}>
                            <option value="">Все</option>
                            {categories.map(c => (
                                <option key={c.category_id} value={c.category_id}>{c.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Шасси</Form.Label>
                        <Form.Select name="chassis" value={filters.chassis} onChange={handleChange}>
                            <option value="">Все</option>
                            {chassisList.map(c => (
                                <option key={c.chassis_id} value={c.chassis_id}>{c.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Производитель</Form.Label>
                        <Form.Select name="factory" value={filters.factory} onChange={handleChange}>
                            <option value="">Все</option>
                            {factories.map(m => (
                                <option key={m.factory_id} value={m.factory_id}>{m.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Колесная формула</Form.Label>
                        <Form.Select name="wheelFormula" value={filters.wheelFormula} onChange={handleChange}>
                            <option value="">Все</option>
                            {wheelFormula.map(w => (
                                <option key={w.wheel_formula_id} value={w.wheel_formula_id}>{w.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Двигатель</Form.Label>
                        <Form.Select name="engine" value={filters.engine} onChange={handleChange}>
                            <option value="">Все</option>
                            {engine.map(e => (
                                <option key={e.engine_id} value={e.engine_id}>{e.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>



                <Col md={9}>
                    <h5>Техника</h5>
                    
                    <CatalogVehicleList vehicles={catalog} filters={filters} />
                </Col>
            </Row>
        </Container>
    )
}
