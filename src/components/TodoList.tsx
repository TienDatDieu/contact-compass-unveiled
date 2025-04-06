
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      if (!user) {
        setTodos([]);
        return;
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      if (data) {
        setTodos(data);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [user]);

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;
    
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          task: newTodo.trim(),
          user_id: user.id,
          is_complete: false
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setTodos(prev => [data, ...prev]);
        setNewTodo('');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      toast({
        title: 'Error',
        description: 'Failed to add todo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodoCompletion = async (todo: Todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !todo.is_complete })
        .eq('id', todo.id);
        
      if (error) throw error;
      
      setTodos(prev => prev.map(t => 
        t.id === todo.id ? { ...t, is_complete: !t.is_complete } : t
      ));
    } catch (err) {
      console.error('Error toggling todo:', err);
      toast({
        title: 'Error',
        description: 'Failed to update todo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete todo. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to manage your todos.</p>
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
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Add a new todo..." 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            disabled={isAdding}
          />
          <Button 
            onClick={addTodo} 
            disabled={!newTodo.trim() || isAdding}
            size="icon"
          >
            {isAdding ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {todos.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No todos yet. Add some tasks to get started!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li 
                key={todo.id} 
                className="p-2 border rounded flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleTodoCompletion(todo)} 
                    className={`mr-2 h-6 w-6 rounded-full ${todo.is_complete ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                  >
                    {todo.is_complete && <Check className="h-4 w-4" />}
                  </Button>
                  <span className={todo.is_complete ? 'line-through text-gray-400' : ''}>
                    {todo.task}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoList;
