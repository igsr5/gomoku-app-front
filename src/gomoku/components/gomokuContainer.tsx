import React, { useState } from "react";
import { useHistory } from "react-router";

import { Board, CurrentStatus } from "./board";
import { SquareListProvider } from "../context/squareListProvider";
import { UsersProvider, User } from "../context/usersProvider";
import { SQUARE_COUNT } from "../squareCount";
import { useQuery } from "../../common/hooks/useQuery";
import { useAxiosClient } from "../../common/context/axiosClientProvider";

export const Gomoku: React.FC = () => {
  const history = useHistory();
  const client = useAxiosClient();
  const query = useQuery();

  // 黒: 0, 白: 1, なし: null
  var squareList: CurrentStatus[][] = new Array(SQUARE_COUNT);
  for (let i = 0; i < SQUARE_COUNT; i++) {
    squareList[i] = new Array(SQUARE_COUNT).fill(null);
  }

  const [user1, setUser1] = useState<User | null>(null);
  const [user2, setUser2] = useState<User | null>(null);

  const user_id_1 = query.get("user_id_1");
  const user_id_2 = query.get("user_id_2");
  // user_idが取得できない場合はホーム画面に飛ばす
  if (!user_id_1 || !user_id_2) history.push("/");

  Promise.all([
    client
      .get(`/users/${user_id_1}`)
      .then((v) => {
        setUser1(v.data.user);
      })
      .catch((e) => {
        if (e.statusCode === 404) {
          history.push("/");
        }
      }),
    client
      .get(`/users/${user_id_2}`)
      .then((v) => {
        setUser2(v.data.user);
      })
      .catch((e) => {
        if (e.statusCode === 404) {
          history.push("/");
        }
      }),
  ]);

  if (!user1 || !user2) {
    return (
      <SquareListProvider squareList={squareList}>
        <Board />
      </SquareListProvider>
    );
  }

  const users = {
    0: user1,
    1: user2,
  };

  return (
    <UsersProvider users={users}>
      <SquareListProvider squareList={squareList}>
        <Board />
      </SquareListProvider>
    </UsersProvider>
  );
};
