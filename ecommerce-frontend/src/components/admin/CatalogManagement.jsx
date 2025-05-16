import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Spinner, Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { catalogService } from '../../services/catalogService';

const CatalogManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    // State untuk mode edit inline
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await catalogService.getAllCatalogs();
            setCategories(data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.message || "Gagal memuat daftar kategori.");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setError('Nama kategori tidak boleh kosong.');
            return;
        }
        setIsAdding(true);
        setError(null);
        try {
            await catalogService.createCatalog({ name: newCategoryName });
            setNewCategoryName(''); // Kosongkan input setelah berhasil
            await fetchCategories(); // Muat ulang daftar kategori
        } catch (err) {
            console.error("Error adding category:", err);
            setError(err.message || "Gagal menambah kategori.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori ini? Produk yang menggunakan kategori ini akan kehilangan kategorinya (atau gagal dihapus jika ada batasan).`)) {
            // Set loading spesifik untuk item (opsional, bisa juga global loading)
            setLoading(true); 
            setError(null);
            try {
                await catalogService.deleteCatalog(id);
                await fetchCategories(); // Muat ulang daftar
            } catch (err) {
                console.error(`Error deleting category ${id}:`, err);
                setError(err.message || "Gagal menghapus kategori.");
                // Set loading false di sini jika error, agar tidak stuck loading
                setLoading(false); 
            } 
            // setLoading(false) akan dijalankan oleh fetchCategories jika sukses
        }
    };

    // Fungsi untuk memulai mode edit
    const handleEditClick = (category) => {
        setEditingCategoryId(category.id);
        setEditCategoryName(category.name);
        setError(null); // Hapus error sebelumnya
    };

    // Fungsi untuk membatalkan edit
    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setEditCategoryName('');
    };

    // Fungsi untuk menyimpan perubahan edit
    const handleSaveEdit = async (id) => {
        if (!editCategoryName.trim()) {
            setError('Nama kategori tidak boleh kosong.');
            return;
        }
        setIsSavingEdit(true);
        setError(null);
        try {
            await catalogService.updateCatalog(id, { name: editCategoryName });
            setEditingCategoryId(null); // Keluar dari mode edit
            setEditCategoryName('');
            await fetchCategories(); // Muat ulang daftar
        } catch (err) {
            console.error(`Error updating category ${id}:`, err);
            setError(err.message || "Gagal memperbarui kategori.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <h2>Manajemen Kategori Produk</h2>
                </Col>
            </Row>

            {/* Form Tambah Kategori */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>Tambah Kategori Baru</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddCategory}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nama Kategori Baru"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        disabled={isAdding}
                                        required
                                    />
                                    <Button variant="success" type="submit" disabled={isAdding}>
                                        {isAdding ? <Spinner as="span" animation="border" size="sm" /> : 'Tambah'}
                                    </Button>
                                </InputGroup>
                                {error && <Alert variant="danger" className="mt-3">{error}</Alert>} 
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Daftar Kategori */}
            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Header>Daftar Kategori Tersedia</Card.Header>
                        <Card.Body>
                            {loading && <div className="text-center"><Spinner animation="border" size="sm" /> Memuat...</div>}
                            {error && !isAdding && !isSavingEdit && <Alert variant="danger">{error}</Alert>} 
                            {!loading && (
                                <ListGroup variant="flush">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <ListGroup.Item key={category.id} className="d-flex justify-content-between align-items-center">
                                                {editingCategoryId === category.id ? (
                                                    // Mode Edit
                                                    <InputGroup size="sm">
                                                        <Form.Control
                                                            type="text"
                                                            value={editCategoryName}
                                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                                            disabled={isSavingEdit}
                                                            autoFocus
                                                        />
                                                        <Button variant="outline-success" onClick={() => handleSaveEdit(category.id)} disabled={isSavingEdit}>
                                                            {isSavingEdit ? <Spinner as="span" animation="border" size="sm"/> : 'Simpan'}
                                                        </Button>
                                                        <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={isSavingEdit}>Batal</Button>
                                                    </InputGroup>
                                                ) : (
                                                    // Mode Tampil
                                                    <>
                                                        <span>{category.name}</span>
                                                        <div>
                                                            <Button 
                                                                variant="outline-secondary" 
                                                                size="sm" 
                                                                className="me-2"
                                                                onClick={() => handleEditClick(category)}
                                                                disabled={loading || editingCategoryId !== null} // Disable jika sedang loading atau item lain diedit
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm" 
                                                                onClick={() => handleDeleteCategory(category.id)}
                                                                disabled={loading || editingCategoryId !== null} // Disable jika sedang loading atau item lain diedit
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <ListGroup.Item className="text-center text-muted">Belum ada kategori.</ListGroup.Item>
                                    )}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CatalogManagement; 