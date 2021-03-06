import * as React from 'react';
import { connect } from 'react-redux';
import './App.scss';
import Header from '../Header';
import Footer from '../Footer';
import Content from '../Content';
import Admin from '../Admin';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { setWeatherData } from '../../reducers/weather/weather';
import { getCurrentUser, getCurrentWeather, getDailyWeather, getHourlyWeather } from '../../restService/restService';
import { setSessionData, clearSession } from '../../reducers/session/session';
import { getCookie, eraseCookie } from '../../helpers';
import { ApplicationState } from 'src/reducers';

const { useEffect } = React;

interface AppProps {
  authToken: string,
  username: string,
  setWeatherData: Function,
  setSessionData: Function,
  clearSession: Function
}

const App: React.FC<AppProps> = ({ authToken, username, setWeatherData, setSessionData, clearSession }) => {

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      setSessionData({ authToken: token });
    }
  }, [])

  useEffect(() => {
    const setCurrentUser = async () => {
      getCurrentUser(authToken).then(res => {
        setSessionData(res);
      }).catch(e => {
        if (e.code === 'ERR0001') {
          eraseCookie('token');
          clearSession();
        }
      });
    }

    if (authToken && !username) {
      setCurrentUser();
    }
  }, [authToken, username])

  useEffect(() => {
    fetchCurrentWeather();
    const weatherRequestInterval = setInterval(
      fetchCurrentWeather,
      60000 // update every minute
    );

    fetchDailyWeather();
    const weatherDailyRequestInterval = setInterval(
      fetchCurrentWeather,
      3600000 // update every hour
    );

    fetchHourlyWeather();
    const weatherHourlyRequestInterval = setInterval(
      fetchHourlyWeather,
      3600000 // update every hour
    );

    return () => {
      clearInterval(weatherRequestInterval);
      clearInterval(weatherDailyRequestInterval);
      clearInterval(weatherHourlyRequestInterval);
    }
  })

  const fetchCurrentWeather = async () => {
    const current = await getCurrentWeather();
    setWeatherData({ current });
  }

  const fetchDailyWeather = async () => {
    const daily = await getDailyWeather();
    setWeatherData({ daily });
  }
  
  const fetchHourlyWeather = async () => {
    const hourly = await getHourlyWeather();
    setWeatherData({ hourly });
  }

  return (
      <div className="App">
        <Router>
          <Header />
            <div className="appMiddle">
              <Switch>
                <Route path="/" exact>
                  <Content />
                </Route>
                <Route path="/admin">
                  <Admin />
                </Route>
              </Switch>
            </div>
          <Footer />
        </Router>
      </div>
  );
}

const mapStateToProps = (state: ApplicationState) => {
  const { session: { username, authToken } } = state;
  return {
    username,
    authToken
  }
};

export default connect(
  mapStateToProps,
  {
    setWeatherData,
    setSessionData,
    clearSession
  }
)(App)
