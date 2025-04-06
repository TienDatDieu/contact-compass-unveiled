
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Todo {
  id: string;
  task: string;
  is_complete: boolean;
  user_id: string;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTodos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('todos')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (data) {
          setTodos(data);
        }
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError('Failed to load todos. The todos table might not exist yet.');
      } finally {
        setLoading(false);
      }
    }

    fetchTodos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="mt-2 text-sm text-gray-500">
            You might need to create a 'todos' table in your Supabase database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <p>No todos found. Add some todos to get started.</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li 
                key={todo.id} 
                className="p-2 border rounded flex items-center"
              >
                <span className={todo.is_complete ? 'line-through text-gray-400' : ''}>
                  {todo.task}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoList;
