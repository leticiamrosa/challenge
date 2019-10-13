import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import produce from "immer";
import "moment/locale/pt-br";
import moment from "moment";
import { Container, ContentLoading } from "./styles";
import api from "../../service/api";
import Graphic from "../../components/Graphic";
import Loading from "../../components/Loading";
import List from "../../components/List";
import ModalFeedBack from "../../components/Modal";

function Week({ history }) {
  const { state } = history.location;

  const latitude = state.coords.lat;
  const longitude = state.coords.lon;
  const city = state.city;

  const [loading, setLoading] = useState(true);
  const [temps, getTemps] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    moment.locale("pt-br");

    async function LoadData() {
      if (!latitude && !longitude) {
        setError(true);
      }

      await api
        .get(
          `/forecast/7days?latitude=${latitude}&longitude=${longitude}&city=${city}&reference=${city}`
        )
        .then(response => {
          createObjData(response.data);
        })
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          setError(true);
          console.log(error);
        });
    }

    LoadData();
  }, []);

  function createObjData(data) {
    // @params data - response da api

    getTemps(
      produce(temps, draft => {
        Array(data).forEach((item, i) => {
          const min = item.points.forecast.temperature_daily_min.map(item =>
            item.toFixed()
          );

          const max = item.points.forecast.temperature_daily_max.map(item =>
            item.toFixed()
          );

          const humidity = item.points.forecast.rel_humidity_daily_avg.map(
            item => item.toFixed()
          );

          item.days.forEach((item, i) => {
            draft.push({
              date: moment(item).format("L"),
              day: moment(item).format("dddd"),
              humidity: humidity[i],
              temp_max: max[i],
              temp_min: min[i]
            });
          });
        });
      })
    );
  }

  function goToHome() {
    history.push("/");
  }

  if (error) {
    return (
      <ContentLoading>
        <ModalFeedBack
          show={error}
          onClick={() => goToHome()}
          onHide={() => goToHome()}
        />
      </ContentLoading>
    );
  }

  if (loading) {
    return (
      <ContentLoading>
        <Loading show={loading} />
      </ContentLoading>
    );
  }

  return (
    <Container>
      <List temps={temps} />
      <Graphic data={temps} />
    </Container>
  );
}

export default withRouter(Week);
