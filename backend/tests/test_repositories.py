import pytest
from src.repositories.question_repository import QuestionRepository
from src.repositories.product_repository import ProductRepository


def test_question_repository_loads_questions():
    repo = QuestionRepository()
    questions = repo.get_all()
    assert len(questions) == 7


def test_questions_sorted_by_order():
    repo = QuestionRepository()
    questions = repo.get_all()
    orders = [q.order for q in questions]
    assert orders == sorted(orders)


def test_question_repository_get_by_id():
    repo = QuestionRepository()
    q = repo.get_by_id("skillLevel")
    assert q is not None
    assert q.id == "skillLevel"


def test_unknown_question_returns_none():
    repo = QuestionRepository()
    assert repo.get_by_id("nonexistent") is None


def test_product_repository_loads_products():
    repo = ProductRepository()
    products = repo.get_all()
    assert len(products) >= 9


def test_product_fuzzy_match():
    repo = ProductRepository()
    product = repo.find_by_name("Agassi Heat Vision")
    assert product is not None
    assert "agassi" in product.id
