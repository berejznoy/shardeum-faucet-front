import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Layout, Input, Button, Alert, Form} from 'antd';
import axios from 'axios'
import {Header, Footer} from "antd/lib/layout/layout";
import ReCAPTCHA from "react-google-recaptcha";
import './App.css'
import Paragraph from "antd/lib/typography/Paragraph";
import Link from "antd/lib/typography/Link";

const {Content} = Layout;

const ADDRESS = process.env.REACT_APP_FAUCET_ADDRESS

const App = () => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState('');
    const [balance, setBalance] = useState('0');
    const [notification, setNotification] = useState('');
    const [isError, setError] = useState(false);
    const captchaRef = useRef(null)

    const getBalance = async () => {
        const response = await axios.get('/api/balance', {
            params: {
                address: ADDRESS
            }
        })
        setBalance(response?.data || '0')
    }

    useEffect(() => {
        getBalance()
    }, [])

    const checkValidation = async () => {
        try {
            const token = await captchaRef.current.executeAsync();

            const validation = await axios.post('/api/validate', null, {
                params: {
                    token
                }
            })
            return validation?.data?.success || false
        } catch (e) {
            throw new Error(e)
        }
    }

    const afterCaptchaAction = (isValid) => {
        const action = {
            'false': () => {
                setError(true)
                setNotification('Invalid captcha!');
            },
            'true': async () => {
                try {
                    const response = await axios.post('/api/sendSHM', null, {
                        params: {
                            address: value
                        },
                        headers: {
                            "Access-Control-Allow-Origin": "https://get-shm.online",
                            "Access-Control-Allow-Credentials": true,
                            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                        }
                    })
                    if (response?.data?.success) {
                        setNotification('Funds have been transferred to your address. Should reflect in your wallet shortly');
                        setError(false)
                    } else {
                        setNotification(response.data.message);
                        setError(true)
                    }
                    setValue('')
                } catch (e) {
                    throw new Error(e)
                }
            }
        }
        return action[String(isValid)]
    }

    const handleClick = async () => {
        try {
            setLoading(true);
            const isCaptchaValid = await checkValidation()
            await afterCaptchaAction(isCaptchaValid)()
        } catch (e) {
            console.error(e)
            setError(true)
            setNotification(e?.response?.data?.message || e?.message);
            setValue('')
        } finally {
            await captchaRef.current.reset()
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Layout className='main'>
            <Header className='main__header'>
                <a className="main__logo"
                   href='https://shardeum.org/'>
                    <svg width="128" height="25" viewBox="0 0 128 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M39.2221 4.37502C42.0431 4.37502 43.8621 5.94902 44.0221 8.50402H41.9981C41.9809 8.16215 41.893 7.82756 41.74 7.52137C41.5869 7.21518 41.3721 6.94404 41.1089 6.72509C40.8458 6.50614 40.5402 6.34412 40.2113 6.24927C39.8824 6.15442 39.5374 6.1288 39.1981 6.17402C37.3381 6.17402 36.1321 7.11402 36.1321 8.56602C36.1321 9.75102 36.8071 10.466 38.1961 10.794L40.6281 11.366C43.0401 11.918 44.2661 13.226 44.2661 15.311C44.2661 17.968 42.2021 19.665 39.0541 19.665C36.0541 19.665 34.0461 18.091 33.9241 15.557H35.9681C36.0091 16.967 37.1941 17.867 39.0541 17.867C41.0161 17.867 42.2631 16.947 42.2631 15.475C42.2631 14.31 41.6301 13.575 40.2191 13.247L37.7911 12.692C35.3791 12.14 34.1321 10.75 34.1321 8.62502C34.1321 6.09102 36.1761 4.37402 39.2211 4.37402"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M46.458 19.398V4.375H48.379V10.956C48.7318 10.3785 49.2322 9.90559 49.8286 9.58586C50.4249 9.26613 51.0958 9.11119 51.772 9.137C54.327 9.137 55.553 10.752 55.553 13.306V19.417H53.632V13.736C53.632 11.712 52.671 10.895 51.241 10.895C50.8443 10.8831 50.4497 10.9559 50.0833 11.1086C49.717 11.2614 49.3875 11.4904 49.1167 11.7806C48.846 12.0708 48.6402 12.4153 48.5132 12.7913C48.3861 13.1673 48.3407 13.5661 48.38 13.961V19.398H46.458Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M67.736 9.42301V19.418H65.978L65.814 17.599C65.469 18.2524 64.9462 18.7949 64.306 19.1638C63.6658 19.5328 62.9344 19.7131 62.196 19.684C59.253 19.684 57.556 17.395 57.556 14.349C57.556 11.283 59.396 9.13701 62.256 9.13701C63.0037 9.09818 63.7463 9.27873 64.3927 9.65645C65.0391 10.0342 65.5609 10.5926 65.894 11.263L66.037 9.42301H67.736ZM62.626 10.895C60.664 10.895 59.499 12.367 59.499 14.431C59.499 16.475 60.643 17.947 62.606 17.947C64.569 17.947 65.774 16.495 65.774 14.431C65.774 12.346 64.589 10.895 62.626 10.895Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M76.2391 11.096H75.3801C74.9784 11.064 74.5745 11.121 74.1973 11.2629C73.8201 11.4048 73.4788 11.6281 73.1978 11.917C72.9168 12.2058 72.7029 12.5531 72.5714 12.9341C72.44 13.315 72.3941 13.7203 72.4371 14.121V19.415H70.5161V9.44401H72.3161L72.4391 10.957C72.6643 10.4143 73.0531 9.95539 73.5514 9.64406C74.0497 9.33272 74.6326 9.18449 75.2191 9.22001C75.5633 9.22262 75.906 9.26353 76.2411 9.34201L76.2391 11.096Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M77.0171 14.452C77.0171 11.386 78.7951 9.138 81.7591 9.138C82.4607 9.10253 83.1586 9.26109 83.776 9.59627C84.3935 9.93145 84.9066 10.4303 85.2591 11.038V4.375H87.1591V19.419H85.4421L85.2781 17.6C84.9455 18.2583 84.4273 18.8047 83.7874 19.1715C83.1476 19.5384 82.4142 19.7096 81.6781 19.664C78.7781 19.664 77.0181 17.497 77.0181 14.452H77.0171ZM85.2351 14.391C85.2351 12.347 84.0291 10.875 82.0671 10.875C80.1051 10.875 78.9601 12.347 78.9601 14.391C78.9601 16.455 80.1051 17.927 82.0671 17.927C84.0291 17.927 85.2351 16.476 85.2351 14.391Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M89.28 14.4307C89.28 11.3037 91.263 9.13672 94.165 9.13672C97.006 9.13672 98.8651 11.0987 98.8651 14.0627V14.7777L91.139 14.7977C91.282 16.9027 92.386 18.0677 94.287 18.0677C94.8858 18.1493 95.4941 18.018 96.0059 17.6967C96.5177 17.3753 96.9004 16.8844 97.087 16.3097H98.887C98.396 18.4557 96.721 19.6617 94.247 19.6617C91.304 19.6617 89.28 17.5367 89.28 14.4287V14.4307ZM91.1801 13.5087H96.949C96.9727 13.1385 96.9168 12.7674 96.7852 12.4206C96.6535 12.0737 96.4491 11.759 96.1858 11.4977C95.9225 11.2363 95.6062 11.0344 95.2584 10.9054C94.9105 10.7763 94.5391 10.7233 94.169 10.7497C93.7914 10.7327 93.4142 10.7908 93.0591 10.9206C92.7041 11.0505 92.3784 11.2495 92.1009 11.5061C91.8233 11.7627 91.5995 12.0719 91.4423 12.4156C91.2851 12.7594 91.1976 13.1309 91.185 13.5087"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M109.822 9.42285V19.4179H108.105L107.905 17.9049C107.544 18.4658 107.043 18.9229 106.452 19.2312C105.86 19.5395 105.199 19.6883 104.532 19.6628C102.202 19.6628 100.894 18.0889 100.894 15.6369V9.42285H102.815V15.0009C102.815 17.1469 103.735 17.9649 105.206 17.9649C106.964 17.9649 107.924 16.8409 107.924 14.6949V9.42285H109.822Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M112.602 19.418V9.42304H114.319L114.503 10.731C114.807 10.2181 115.246 9.79828 115.772 9.51726C116.298 9.23625 116.892 9.10474 117.487 9.13704C118.16 9.10016 118.828 9.27556 119.397 9.6385C119.965 10.0015 120.405 10.5336 120.655 11.16C120.914 10.5274 121.365 9.99195 121.944 9.62904C122.523 9.26613 123.202 9.09405 123.884 9.13704C124.382 9.09876 124.883 9.16974 125.351 9.34504C125.819 9.52033 126.243 9.7957 126.593 10.1519C126.943 10.5081 127.212 10.9365 127.379 11.4072C127.547 11.8779 127.61 12.3796 127.563 12.877V19.418H125.683V13.347C125.726 13.0329 125.7 12.7132 125.607 12.4102C125.514 12.1072 125.355 11.8282 125.143 11.5927C124.931 11.3572 124.67 11.1709 124.378 11.0467C124.086 10.9226 123.771 10.8637 123.454 10.874C123.117 10.8657 122.782 10.9294 122.472 11.061C122.161 11.1927 121.883 11.3891 121.654 11.6372C121.426 11.8853 121.253 12.1793 121.148 12.4995C121.043 12.8198 121.007 13.1588 121.043 13.494V19.422H119.143V13.327C119.188 13.0165 119.164 12.6999 119.072 12.3998C118.98 12.0998 118.823 11.8237 118.612 11.5913C118.401 11.359 118.142 11.1761 117.852 11.0557C117.562 10.9353 117.249 10.8805 116.936 10.895C116.6 10.8841 116.266 10.9454 115.955 11.0748C115.645 11.2042 115.366 11.3987 115.137 11.6452C114.909 11.8917 114.736 12.1844 114.63 12.5035C114.524 12.8227 114.488 13.1608 114.524 13.495V19.423L112.602 19.418Z"
                            fill="var(--chakra-colors-text)"></path>
                        <path d="M7.25003 18.5508L4.10303 24.0018H25.522L22.375 18.5508H7.25003Z"
                              fill="var(--chakra-colors-text)"></path>
                        <path d="M14.8131 5.451L11.6661 0L0.956055 18.55H7.25005L14.8131 5.451Z"
                              fill="var(--chakra-colors-text)"></path>
                        <path d="M22.374 18.549H28.665L17.959 0L14.812 5.451L22.374 18.549Z"
                              fill="var(--chakra-colors-text)"></path>
                        <path
                            d="M18.219 14.2008C18.2204 14.875 18.0217 15.5344 17.6482 16.0956C17.2746 16.6568 16.7429 17.0946 16.1205 17.3535C15.498 17.6124 14.8127 17.6808 14.1513 17.5501C13.4899 17.4193 12.8822 17.0953 12.405 16.619C11.9279 16.1427 11.6028 15.5356 11.4709 14.8744C11.339 14.2133 11.4062 13.5278 11.664 12.9049C11.9218 12.282 12.3586 11.7495 12.9192 11.375C13.4798 11.0004 14.1388 10.8006 14.813 10.8008C15.7152 10.801 16.5805 11.1592 17.219 11.7965C17.8575 12.4339 18.2172 13.2986 18.219 14.2008Z"
                            fill="var(--chakra-colors-text)"></path>
                    </svg>
                </a>
                <p className='main__logo'>Balance: {balance} SHM</p>
            </Header>
            <Content className="main__content">
                <h1>Shardeum Sphinx 1.X</h1>
                <Form className='main__form' onSubmitCapture={handleClick}>
                    <Form.Item>
                        <Input value={value} size='large' onChange={handleInputChange}
                               placeholder="Enter your SHM address"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={loading} disabled={!value} htmlType="submit" size='middle'
                                className='main__button'>
                            {loading ? '' : 'Get tokens'}
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Paragraph>Check faucet in <Link
                            href={`https://explorer-sphinx.shardeum.org/account/${ADDRESS}`}
                            target='_blank'
                        >Explorer</Link>
                        </Paragraph>

                    </Form.Item>
                </Form>
                <div className='main__alert'>
                    {notification && (
                        <Alert
                            message={notification}
                            type={isError ? 'error' : 'success'}
                            closable
                            onClose={() => setNotification('')}
                        />
                    )}
                    <Paragraph className='main__block-info'>Подписывайтесь на нашу группу в телеграм - <Link
                        href='https://t.me/shardeumrus' target='_blank'>https://t.me/shardeumrus</Link></Paragraph>
                </div>
            </Content>
            <Footer className='main__footer'>
                <ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY} ref={captchaRef} size="invisible"/>
                <Paragraph>Created by <Link href='https://t.me/shardeumrus'
                                            target='_blank'>ShardeumRus</Link></Paragraph>
            </Footer>
        </Layout>
    );
};

export default App;