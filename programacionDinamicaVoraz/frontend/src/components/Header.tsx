/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/Header.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/24/2024
 * License: GNU-GPL
 */

import React, { useState, useEffect, useCallback } from 'react';

interface HeaderProps {
  subject: string;
  onFileSelect: (fileName: string) => void;
  selectedFile: string;
}

const Header: React.FC<HeaderProps> = ({ subject, onFileSelect, selectedFile }) => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchFileList = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/files');
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const files = await response.json();
      const filesList = Array.isArray(files) ? files : [];

      setFileList(filesList);

      if (filesList.length > 0) {
        if (!selectedFile || !filesList.includes(selectedFile)) {
          const lastFile = filesList[filesList.length - 1];
          onFileSelect(lastFile);
        }
      } else {
        onFileSelect('');
      }
      setErrorMessage('');
    } catch (error) {
      console.error('Error al obtener la lista de archivos:', error);
      setErrorMessage('Error al obtener la lista de archivos.');
    } 
  }, [selectedFile, onFileSelect]);

  useEffect(() => {
    fetchFileList();
  }, [fetchFileList]);

  const openFileDialog = useCallback(() => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('http://localhost:8080/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            setFileList((prevList) => [...prevList, file.name]);
            onFileSelect(file.name);
            setErrorMessage('');
          } else {
            throw new Error('Error al subir el archivo');
          }
        } catch (error) {
          console.error('Error al subir el archivo:', error);
          setErrorMessage('Error al subir el archivo.');
          alert('Error al subir el archivo');
        }
      }
    },
    [onFileSelect]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const fileName = event.target.value;
      onFileSelect(fileName);
    },
    [onFileSelect]
  );

  return (
    <header className="flex flex-col text-lg items-center pt-10">
      <h2 className="italic font-light">{subject}</h2>
      <h1 className="text-6xl flex mt-2">
        <img src="/logo.png" alt="Modex" className="w-12 mr-2 inline-block" />
        <span className="text-[#00ADD8]">Mod</span>ex
      </h1>

      <div className="file-loader my-8 flex gap-1">
        <select
          name="files"
          className="bg-[#333] w-72 border-2 rounded-md border-[#00ADD8]"
          id="file-select"
          onChange={handleFileSelect}
          value={selectedFile}
        >
          {fileList.map((file) => (
            <option value={file} key={file}>
              {file}
            </option>
          ))}
        </select>
        <button
          className="bg-[#00ADD8] rounded-md px-2 text-2xl font-bold text-white"
          onClick={openFileDialog}
        >
          +
        </button>
        <input
          type="file"
          id="file-input"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </header>
  );
};

export default Header;
