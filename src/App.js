import React, { useState } from 'react';
import { Layout, Input, Button, Alert } from 'antd';
import axios from 'axios'

const { Content } = Layout;

const App = () => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState('');
    const [notification, setNotification] = useState('');
    const [isError, setError] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://shardeum-faucet.vercel.app/sendSHM', null, {
                params: {
                    address: value
                }})
            if(response.data.success) {
                setNotification('Funds have been transferred to your address. Should reflect in your wallet shortly');
                setError(false)
            } else {
                setNotification(response.data.message);
                setError(true)
            }

        } catch (e) {
            setError(true)
            setNotification(e?.response.data?.message);
        } finally {
            setLoading(false);
            setValue('')
        }
    };

    const handleInputChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Layout>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', padding: '0 20px'}}>
                <Input value={value} onChange={handleInputChange} placeholder="Enter your SHM address"/>
                <Button type="primary" onClick={handleClick} loading={loading} style={{marginTop:'20px', width: "200px"}}>
                    {loading ? '' : 'Get tokens'}
                </Button>
                    {notification && (
                        <Alert
                            style={{marginTop:'20px'}}
                            message={notification}
                            type={isError ? 'error' : 'success'}
                            showIcon
                            closable
                            onClose={() => setNotification('')}
                        />
                    )}
                    <div style={{marginTop:'20px'}}>Created by <a href='https://t.me/shardeumrus' target='_blank'>ShardeumRus</a></div>
                    <div style={{marginTop:'20px'}}>Подписывайтесь на нашу группу в телеграм - <a href='https://t.me/shardeumrus' target='_blank'>https://t.me/shardeumrus</a></div>
                </div>
            </Content>
        </Layout>
    );
};

export default App;