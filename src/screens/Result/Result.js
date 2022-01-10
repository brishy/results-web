import React, { useState, useEffect } from "react";
import Bar from "../../components/Bar/Bar";
import style from "./Result.module.css";
import { urlList, periods, periodsData } from "../../utils/data";
import DataCard from "../../components/DataCard/DataCard";
import Loader from "../../components/Loader/Loader";
import GPA from "../../components/GPA/GPA";
import Modal from "../../components/Modal/Modal";
import { useHistory } from "react-router-dom";
import Motion from "../../js/Motion";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";
import Estimator from "../../components/Estimator/Estimator";

const Result = ({ location }) => {
  const { regId, periodName, urlPosition } = location.state;
  const [loaderIsVisible, setLoaderIsVisible] = useState(true);
  const [modalIsVisible, setModalIsVisible] = useState(true);
  const { period, step } = periodsData[urlPosition];
  const [collection, setCollection] = useState({});
  const [lateCollection, setLateCollection] = useState({});
  const history = useHistory();

  useEffect(() => {
    const modal = JSON.parse(window.localStorage.getItem("results-modal"));

    if (!modal) {
      setModalIsVisible(() => modal);
    }
  }, []);
  useEffect(() => {
    let isUnmount = false;

    const getData = async () => {
      const url = urlList[urlPosition];

      fetch(`${process.env.REACT_APP_BASE_URL}${url}`)
        .then((response) => response.json())
        .then((data) => {
          if (!isUnmount) setCollection(data[regId.toString()]);
          setLoaderIsVisible(() => false);
        })
        .catch((error) => {
          // setLoaderIsVisible(() => false);
        });
    };
    const getLateData = async (count) => {
      if (count === 0) return;
      const url = urlList[urlPosition + count];

      fetch(`${process.env.REACT_APP_BASE_URL}${url}`)
        .then((response) => response.json())
        .then((data) => {
          if (!isUnmount) {
            setLoaderIsVisible(false);
            setLateCollection(data[regId.toString()]);
          }
        });
    };

    getData();

    if (Number(regId.substring(0, 4)) === Number(period.split(" ")[1])) {
      //do nothing
    } else getLateData(step);
    // setLoaderIsVisible(false);

    //old code:
    /*  if (periodName === `Aug Sem 2021` && urlPosition < 7 && !isUnmount) {
      if (Number(regId.substring(0, 4)) >= 2020) getLateData(2);
      else setLoaderIsVisible(false);
    } else if (
      periodName === `May/June 2021` &&
      urlPosition < 7 &&
      !isUnmount
    ) {
      getLateData(2);
      setLoaderIsVisible(false);
    } else if (
      //change this to else if
      Number(regId.substring(0, 4)) < 2020 &&
      urlPosition < 7 &&
      periodName !== `Nov/Dec ${regId.substring(0, 4)}` &&
      !isUnmount
    ) {
      getLateData(1);
    } else {
      setLoaderIsVisible(false);
    } */

    return () => (isUnmount = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    history.goBack();
  };

  let displayData;

  if (collection) {
    displayData = (
      <>
        <div className={style.infoTag}>
          ID:
          <span>{regId}</span>
          For
          <span>{periodName}</span>
        </div>
        <div className={style.container}>
          <div className={`${style.tagsContainer}`}>
            <div
              className={`${style.nameTag} ${style.web_design}`}
              style={{
                fontWeight: "bold",
                paddingTop: "15px",
              }}
            >
              {collection.name}
            </div>
            <div className={style.infoTagWeb}>
              ID:
              <span>{regId}</span>
              For
              <span>{periodName}</span>
            </div>
            <div className={`${style.nameTag} ${style.gpaTag} `}>
              <GPA data={collection} />
            </div>
            <Link
              to={{
                pathname: "/form/result/analyzer",
                state: {
                  collection: collection,
                  lateCollection: lateCollection,
                  periodName: periodName,
                  /* 
                  //old code
                  latePeriodName:
                    periodName === `Aug Sem 2021` ||
                    periodName === `May/June 2021`
                      ? periods[urlPosition + 2]
                      : periods[urlPosition + 1], */
                  latePeriodName: periods[urlPosition + step],
                },
              }}
              className={style.analyzeTag}
              style={{
                textDecoration: "none",
              }}
            >
              <div>
                Analyzer
                <span>
                  Click on me to see your results and get a more detailed view
                  of what your performance is with comparision.
                </span>
              </div>
            </Link>
          </div>

          <div className={style.card_container}>
            {Object.keys(collection).map((code) => {
              return code !== "name" ? (
                <DataCard
                  key={code}
                  code={code}
                  credit={collection[code]["credit"]}
                  ext={collection[code]["ext"]}
                  grade={collection[code]["grade"]}
                  int={collection[code]["int"]}
                  sub={collection[code]["sub"]}
                  tot={collection[code]["tot"]}
                />
              ) : null;
            })}
          </div>
        </div>
        {modalIsVisible ? (
          <div className={style.modal_web}>
            <Modal
              value="Hover on the subject card to see marks."
              click={() => {
                setModalIsVisible(false);
                window.localStorage.setItem("results-modal", "false");
              }}
            />
          </div>
        ) : null}
        <Estimator className={style.estimator} />
      </>
    );
  } else {
    displayData = (
      <Modal value={"Registration Id not found"} click={handleClick} />
    );
  }

  return (
    <div className={style.result}>
      <Bar title="Result" arrowIsVisible={true} pathName="Form" />

      {displayData}
      {loaderIsVisible ? <Loader /> : null}
      <Motion Component={<Footer />} />
    </div>
  );
};

export default Result;
