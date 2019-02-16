import { useReducer, useCallback } from 'react';

const initialState: State = {
  count: 0
};

interface State {
  count: number;
}
const reducer = (state: State, action: any) => {
  switch (action.type) {
    case 'increment': {
      return { ...state, count: state.count + 1 };
    }
    case 'decrement': {
      return { ...state, count: state.count - 1 };
    }
    default: {
      return state;
    }
  }
};

export function useCounter(state = initialState) {
  const [{ count }, dispatch] = useReducer(reducer, state);
  const increment = useCallback(() => {
    dispatch({ type: 'increment' });
  }, [dispatch]);
  const decrement = useCallback(() => {
    dispatch({ type: 'decrement' });
  }, [dispatch]);
  return { count, increment, decrement };
}

export default useCounter;
