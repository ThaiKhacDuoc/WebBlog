import { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './taskInput.module.scss'
import { Todo } from '../../@types/todo.type'

interface TaskInputProps {
  addTodo: (name: string) => void
  currenTodo: Todo | null
  editTodo: (name: string) => void
  finishdEditTodo: () => void
}

export default function TaskInput(props: TaskInputProps) {
  const [name, setName] = useState<string>('')
  const { addTodo, currenTodo, editTodo, finishdEditTodo } = props

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (currenTodo) {
      finishdEditTodo()
      setName('')
    } else {
      addTodo(name)
      setName('')
    }
  }

  const handleName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (currenTodo) {
      editTodo(value)
    } else {
      setName(value)
    }
  }
  return (
    <div className='mb-2'>
      <h1 className={styles.title}>To do list typescript</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='caption goes here'
          value={currenTodo ? currenTodo.name : name}
          onChange={handleName}
        />
        <button type='submit'>{currenTodo ? '✔️' : '➕'}</button>
      </form>
    </div>
  )
}

TaskInput.propTypes = {
  addTodo: PropTypes.func.isRequired,
  currenTodo: PropTypes.oneOfType([
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      done: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired
    }),
    PropTypes.oneOf([null])
  ]),
  editTodo: PropTypes.func.isRequired,
  finishdEditTodo: PropTypes.func.isRequired
}
