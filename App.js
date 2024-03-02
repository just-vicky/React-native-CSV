import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const App = () => {
  const [fileUri, setFileUri] = useState(null);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
    });
    if (!result.cancelled) {
      setFileUri(result.uri);
      console.log(result); // Log the file details
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick a file" onPress={pickDocument} />
      {fileUri && <Text>Selected file: {fileUri}</Text>}
    </View>
  );
};

export default App;
