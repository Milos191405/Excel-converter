import { useState } from "react";
import { read, utils } from "xlsx";
import Dropdown from "./Dropdown";

function Home() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const convertDates = (json) => {
    const regex = /(\d+)\.(\d+)\.(\d+)/
    console.log("Before json:", [...json]);
    
    json.forEach( line => {
      const {Datum} = line
        const match = regex.exec(Datum)
        // console.log("match:", match);
        const [ , day, month, year ] = match
        const date = new Date(`${year}-${month}-${day}`)

        line.date = date
    })

    console.log("After json:", json);


    return json
  }

  const convertExcelToJson = () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = convertDates(utils.sheet_to_json(worksheet));

        setItems(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error converting Excel file:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      convertExcelToJson();
    }
  };

  const sortItems = () => {
    if (!sortBy) {
      console.error("No sort column selected.");
      return;
    }

    const sortedItems = [...items].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });

    setItems(sortedItems);
  };

  return (
    <>
      <div className="container mx-auto w-full mt-5 ">
        <div className="text-end ">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
            Login
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Sign Up
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">List of items</h1>

        <div className="flex justify-center items-center">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            onKeyPress={handleKeyPress}
            className="  border border-solid border-red-500 justify-center"
          />
          <button
            onClick={convertExcelToJson}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Convert
          </button>
        </div>

        <div className="flex justify-center">
          <Dropdown
            options={items.length > 0 ? Object.keys(items[0]) : []}
            onSelect={(selectedOption) => setSortBy(selectedOption)}
          />
          <button
            onClick={sortItems}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-3"
          >
            Sort
          </button>
        </div>

        <div className="container mx-auto p-4 flex justify-center">
          <table className="table-auto mt-4">
            <thead>
              <tr>
                {items.length > 0 &&
                  Object.keys(items[0]).map((key, index) => (
                    <th key={index} className="px-4 py-2">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(item).map((key, cellIndex) => {
                    let value
                    if (key === "date") {
                      value = item[key].toLocaleString()
                    } else {
                      value = item[key]
                    }

                    return (
                    <td key={cellIndex} className="px-4 py-2">
                      {value}
                    </td>
                  )})}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Home;
