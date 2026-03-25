import pytest
from unittest.mock import MagicMock, AsyncMock
import uuid
from app.repositories.todo_repository import TodoRepository
from app.models.todo import TodoStatus, Priority

@pytest.mark.asyncio
async def test_get_user_todo_stats_logic():
    # Mock the session
    mock_session = MagicMock()
    mock_session.execute = AsyncMock()
    
    # Mock results for summary_query (total, completed)
    mock_summary_result = MagicMock()
    mock_summary_result.one.return_value = (10, 4) # total=10, completed=4
    
    # Mock results for priority_query
    mock_priority_result = MagicMock()
    mock_priority_result.all.return_value = [
        (Priority.LOW, 3),
        (Priority.MEDIUM, 5),
        (Priority.HIGH, 2),
    ]
    
    # Mock execute to return summary then priority results
    mock_session.execute.side_effect = [mock_summary_result, mock_priority_result]
    
    repo = TodoRepository(mock_session)
    owner_id = uuid.uuid4()
    
    total, completed, pending, by_priority = await repo.get_user_todo_stats(owner_id)
    
    # Verify logic: pending should be total - completed
    assert total == 10
    assert completed == 4
    assert pending == 6 # 10 - 4
    assert by_priority[Priority.LOW] == 3
    assert by_priority[Priority.MEDIUM] == 5
    assert by_priority[Priority.HIGH] == 2
    
    # Verify summary_query total columns handled
    assert mock_session.execute.call_count == 2
