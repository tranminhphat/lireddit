import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
} from "@chakra-ui/react";
import { useField } from "formik";
import * as React from "react";
import { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
	placeholder: string;
};

const InputField: React.FC<InputFieldProps> = ({
	label,
	size: _,
	...props
}: InputFieldProps) => {
	const [field, { error }] = useField(props);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<Input
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			<FormErrorMessage>{error}</FormErrorMessage>
		</FormControl>
	);
};

export default InputField;
