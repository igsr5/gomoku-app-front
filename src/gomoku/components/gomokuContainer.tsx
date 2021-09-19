import React, { useState } from "react";
import { useHistory } from "react-router";
import { Col, Row } from "react-bootstrap";

import { Board, CurrentStatus } from "./board";
import { SquareListProvider } from "../context/squareListProvider";
import { UsersProvider, User } from "../context/usersProvider";
import { SQUARE_COUNT } from "../squareCount";
import { useQuery } from "../../common/hooks/useQuery";
import { useAxiosClient } from "../../common/context/axiosClientProvider";
import { Ranking } from "../../ranking/components/rankingContainer";

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

  client
    .get(`/users/${user_id_1}`)
    .then((v) => {
      setUser1(v.data.user);
      if (user_id_2 === "-1") setUser2({ id: -1, name: "CPU" });
    })
    .catch((e) => {
      if (e.statusCode === 404) {
        history.push("/");
      }
    });
  // CPUと対戦する場合
  // user_id_2 === -1 はuser2がCPUであることを示す
  if (user_id_2 !== "-1") {
    client
      .get(`/users/${user_id_2}`)
      .then((v) => {
        setUser2(v.data.user);
      })
      .catch((e) => {
        if (e.statusCode === 404) {
          history.push("/");
        }
      });
  }

  if (!user1 || !user2) {
    return (
      <Row>
        <Col lg={7}>
          <SquareListProvider squareList={squareList}>
            <Board loading={true} />
          </SquareListProvider>
        </Col>
        <Col lg={5}>
          <Ranking />
        </Col>
      </Row>
    );
  }

  const users = {
    0: user1,
    1: user2,
  };

  return (
    <Row>
      <Col lg={7}>
        <UsersProvider users={users}>
          <SquareListProvider squareList={squareList}>
            <Board loading={false} />
          </SquareListProvider>
        </UsersProvider>
      </Col>
      <Col lg={5}>
        <Ranking />
      </Col>
    </Row>
  );
};
