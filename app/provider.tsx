"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
import { OnSaveContext } from '@/context/OnSaveContext';
import { ThemeProvider } from '@/context/ThemeContext';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<any>();
  const [onSaveData, setOnSaveData] = useState<any>(null);

  useEffect(() => {
    user && createNewUser();
  }, [user])

  const createNewUser = async () => {
    const result = await axios.post('/api/users', {});
    console.log(result.data?.user);

    setUserDetail(result.data?.user);

  }


  return (
    <div>
      <ThemeProvider>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
          <OnSaveContext.Provider value={{onSaveData, setOnSaveData}}>
            {children}
          </ OnSaveContext.Provider>
        </UserDetailContext.Provider>
      </ThemeProvider>
    </div>
  )
}

export default Provider
