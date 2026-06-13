def test_app_importable():
    from src.app import create_app
    app = create_app()
    assert app is not None
