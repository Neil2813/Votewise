from app.services.retrieval import kb

def test_sources_loaded():
    assert "election_rules.txt" in kb.sources()
    assert "misinformation.txt" in kb.sources()

def test_retrieve_rules():
    hits = kb.retrieve("nomination rules")
    assert hits
