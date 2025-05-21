import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { newsApi, imagesApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CreateNewsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        content: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newsPayload = {
            title: form.title,
            content: form.content,
            user_id: user.user_id
        }

        const response = await newsApi.create(newsPayload)
        const newsId = response.data.news_id

        if (selectedImage) {
            const formData = new FormData();
            formData.append('file', selectedImage);

            await imagesApi.uploadNewsImage(newsId, formData)
        }

        // const formData = new FormData();
        // formData.append('title', form.title);
        // formData.append('content', form.content);
        // formData.append('user_id', user.user_id);

        // if (selectedImage) {
        //   formData.append('image', selectedImage);
        // }

        // await newsApi.create(formData);
        navigate('/admin');
    };

  return (
    <Container className="mt-4 mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Создать новость</Card.Title>

          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Заголовок</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Содержимое</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="content"
                value={form.content}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <input
                type="file"
                className="form-control"
                id="image"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleImageChange}
            />

            <Button type="submit">Создать</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}