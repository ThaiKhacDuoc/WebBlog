import { useEffect, useState } from 'react'
import TaskInput from '../TaskInput'
import TaskList from '../TaskList'
import styles from './todoList.module.scss'
import { Todo } from '../../@types/todo.type'

interface HandleNewTodos {
  (todo: Todo[]): Todo[]
}

const syncTodoReact = (HandleNewTodos: HandleNewTodos) => {
  const todoString = localStorage.getItem('todos')
  const todoObj: Todo[] = JSON.parse(todoString || '[]')
  const newTodoObj = HandleNewTodos(todoObj)
  localStorage.setItem('todos', JSON.stringify(newTodoObj))
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null)
  const doneTask = todos.filter((todo) => todo.done)
  const notdoneTask = todos.filter((todo) => !todo.done)

  useEffect(() => {
    const todoString = localStorage.getItem('todos')
    const todoObj: Todo[] = JSON.parse(todoString || '[]')
    setTodos(todoObj)
  }, [])

  const addTodo = (name: string) => {
    const handle = (todoObj: Todo[]) => {
      const result = [...todoObj, todo]
      return result
    }
    const todo: Todo = {
      name,
      id: new Date().toISOString(),
      done: false
    }
    setTodos((prev) => [...prev, todo])
    syncTodoReact(handle)
  }

  const handleDoneTodo = (id: string, done: boolean) => {
    setTodos((prev) => {
      return prev.map((todo) => {
        if (todo.id === id) {
          return { ...todo, done }
        }
        return todo
      })
    })
  }

  const startEditTodo = (id: string) => {
    const findTodo = todos.find((todo) => todo.id === id)
    if (findTodo) {
      setCurrentTodo(findTodo)
    }
  }

  const editTodo = (name: string) => {
    setCurrentTodo((prev) => {
      if (prev) return { ...prev, name }
      return null
    })
  }

  const finishdEditTodo = () => {
    const handle = (todoObj: Todo[]) => {
      return todoObj.map((todo) => {
        if (todo.id === currentTodo?.id) return currentTodo
        else return todo
      })
    }
    setTodos(handle)
    setCurrentTodo(null)
    syncTodoReact(handle)
  }

  const deleteTodo = (id: string) => {
    const handle = (todoObj: Todo[]) => {
      const findTodo = todoObj.findIndex((todo) => todo.id === id)
      if (findTodo > -1) {
        const result = [...todoObj]
        result.splice(findTodo, 1)
        return result
      }
      return todoObj
    }
    if (currentTodo) {
      setCurrentTodo(null)
    }
    setTodos(handle)
    syncTodoReact(handle)
  }

  return (
    <div className={styles.todoList}>
      <div className={styles.todoListContainer}>
        <TaskInput addTodo={addTodo} currenTodo={currentTodo} editTodo={editTodo} finishdEditTodo={finishdEditTodo} />
        <TaskList
          doneTaskList={true}
          todos={notdoneTask}
          handleDoneTodo={handleDoneTodo}
          startEditTodo={startEditTodo}
          deleteTodo={deleteTodo}
        />
        <TaskList
          todos={doneTask}
          handleDoneTodo={handleDoneTodo}
          startEditTodo={startEditTodo}
          deleteTodo={deleteTodo}
        />
      </div>
    </div>
  )
}
