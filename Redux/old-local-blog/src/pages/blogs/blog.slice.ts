import { Post } from '../../types/blog.type'
import { createSlice, PayloadAction, createAsyncThunk, AsyncThunk } from '@reduxjs/toolkit'
import http from 'utils/http'
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
  currentRequestId: string | undefined
}

const initialState: BlogState = {
  postList: [],
  editingPost: null,
  loading: false,
  currentRequestId: undefined
}

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})

export const createPost = createAsyncThunk('blog/createPostList', async (body: Omit<Post, 'id'>, thunkAPI) => {
  try {
    const response = await http.post<Post>('posts', body, {
      signal: thunkAPI.signal
    })
    return response.data
  } catch (error: any) {
    if (error.name === 'AxiosError' && error.response.status === 422) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
    throw error
  }
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ idPost, body }: { idPost: string; body: Post }, thunkAPI) => {
    try {
      const response = await http.put<Post>(`posts/${idPost}`, body, {
        signal: thunkAPI.signal
      })
      return response.data
    } catch (error: any) {
      if (error.name === 'AxiosError' && error.response.status === 422) {
        return thunkAPI.rejectWithValue(error.response.data)
      }
      throw error
    }
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (idPost: string, thunkAPI) => {
  const response = await http.delete<Post>(`posts/${idPost}`, {
    signal: thunkAPI.signal
  })
  return response.data
})

// export const addPost = createAction('blog/addPost', function (post: Omit<Post, 'id'>) {
//   return {
//     payload: {
//       ...post,
//       id: nanoid()
//     }
//   }
// })
// export const deletePost = createAction<string>('blog/deletePost')
// export const startEditing = createAction<string>('blog/editPost')
// export const cancelEditing = createAction('blog/cancelEditing')
// export const finishEditing = createAction<Post>('blog/finishEditing')

const blogSlice = createSlice({
  name: 'blog',
  initialState: initialState,
  reducers: {
    startEditing: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const Find = state.postList.find((post) => post.id === postId) || null
      state.editingPost = Find
    },
    cancelEditing: (state) => {
      state.editingPost = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload
            return true
          }
          return false
        })
        state.editingPost = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg
        const postIndex = state.postList.findIndex((post) => post.id === postId)
        if (postIndex !== -1) {
          state.postList.splice(postIndex, 1)
        }
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<RejectedAction | FulfilledAction>(
        (action) => action.type.endsWith('/rejected') || action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
  }
})

export const { cancelEditing, startEditing } = blogSlice.actions
const blogReducer = blogSlice.reducer
export default blogReducer

// const blogReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(addPost, (state, action) => {
//       const post = action.payload
//       state.postList.push(post)
//     })
//     .addCase(deletePost, (state, action) => {
//       const postId = action.payload
//       const FindItem = state.postList.findIndex((item) => item.id === postId)
//       if (FindItem !== -1) {
//         state.postList.splice(FindItem, 1)
//       }
//     })
//     .addCase(startEditing, (state, action) => {
//       const postId = action.payload
//       const Find = state.postList.find((post) => post.id === postId) || null
//       state.editingPost = Find
//     })
//     .addCase(cancelEditing, (state) => {
//       state.editingPost = null
//     })
//     .addCase(finishEditing, (state, action) => {
//       const postId = action.payload.id
//       state.postList.some((post, index) => {
//         if (post.id === postId) {
//           state.postList[index] = action.payload
//           return true
//         }
//         return false
//       })
//       state.editingPost = null
//     })
// })

// export default blogReducer
