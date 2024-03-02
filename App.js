import React, { useState } from 'react';
import { View, Button, TextInput, FlatList, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

const App = () => {
  const [fileUri, setFileUri] = useState(null);
  const [csvData, setCsvData] = useState([]);

  const pickDocument = async () => {
    console.log('Pick document function called');
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled === false) {
        setFileUri(result.assets[0].uri);
        const fileData = await readFile(result.assets[0].uri);
        if (fileData) {
          const parsedData = Papa.parse(fileData);
          if (parsedData.errors.length > 0) {
            console.error('Error parsing CSV:', parsedData.errors);
          } else {
            setCsvData(parsedData.data);
          }
        } else {
          console.error('Failed to read file data');
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const readFile = async (uri) => {
    console.log('Reading file');
    try {
      const response = await fetch(uri);
      const fileData = await response.text();
      return fileData;
    } catch (error) {
      return null;
    }
  };

  const handleCellChange = (text, rowIndex, cellIndex) => {
    const newData = [...csvData];
    newData[rowIndex][cellIndex] = text;
    setCsvData(newData);
  };

  const saveChangesAsCSV = async () => {
    try {
      const csvString = Papa.unparse(csvData);
      const filename = 'modified_data.csv';
  
      if (Platform.OS === 'web') {
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const filePath = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(filePath, csvString);
        await FileSystem.downloadAsync(
          filePath,
          FileSystem.documentDirectory + 'expo_data.csv'
        );
      }
    } catch (error) {
      console.error('Error saving CSV:', error);
    }
  };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick a file" onPress={pickDocument} />
      {csvData.length > 0 && (
        <>
          <FlatList
            data={csvData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index: rowIndex }) => (
              <View style={{ flexDirection: 'row' }}>
                {item.map((cell, cellIndex) => (
                  <TextInput
                    key={cellIndex}
                    style={{ margin: 5, borderWidth: 1, padding: 5, minWidth: 50 }}
                    value={cell}
                    onChangeText={(text) => handleCellChange(text, rowIndex, cellIndex)}
                  />
                ))}
              </View>
            )}
          />
          <Button title="Save Changes as CSV" onPress={saveChangesAsCSV} />
        </>
      )}
    </View>
  );
};

export default App;
