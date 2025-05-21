import { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { categoriesApi } from '../api';

export default function CategoriesList() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await categoriesApi.getAll();

            console.log(response);

            setCategories(response.data)
        };

        fetchCategories();
    }, []);

    return (
        <Nav className="flex-column bg-light">
            <h4 className="p-3">Категории техники</h4>
            {categories.map((category) => (
                // <Nav.Link as={NavLink} to="/" end>Главная</Nav.Link>
                <Nav.Link as={NavLink} key={category.category_id} to="/catalog">
                    {category.name}
                </Nav.Link>
            ))}
        </Nav>
    );
}
