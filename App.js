import React, { useState } from 'react';
import { View, Button, Text, FlatList, Platform, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';



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



  const exportCsv = async () => {
    if (fileUri) {
      await exportCsvFile(fileUri);
    } else {
      console.error('No file selected');
    }
  };

  const exportCsvFile = async (fileUri, fileName = 'File.csv') => {
    try {
      const csvContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return;
      }
  
      try {
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'text/csv')
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
            alert('CSV file exported successfully');
          })
          .catch((e) => {
            console.error('Error saving CSV file:', e);
          });
      } catch (e) {
        console.error('Error creating CSV file:', e);
      }
  
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };
  
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick a file" onPress={pickDocument} />
      {csvData.length > 0 && (
        <FlatList
          data={csvData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row' }}>
              {item.map((cell, index) => (
                <Text key={index} style={{ margin: 5 }}>{cell}</Text>
              ))}
            </View>
          )}
        />
      )}
      <Button title="Pick a file" onPress={exportCsv} />
    </View>
  );
};

export default App;
